import uuid
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import structlog

from ..models import CoverageMapping, TestHistory, AnalyzerResult, Repository
from ..schemas import AnalysisRequest, TestInfo, AnalysisResponse
from ..services.aws_service import aws_service

logger = structlog.get_logger()


class ImpactAnalyzer:
    """Core service for analyzing impact of code changes and selecting relevant tests"""
    
    def __init__(self):
        self.risk_weights = {
            'high': 0.8,
            'medium': 0.5,
            'low': 0.2
        }
    
    async def analyze_impact(self, db: AsyncSession, request: AnalysisRequest) -> AnalysisResponse:
        """Analyze the impact of changed files and select relevant tests"""
        try:
            logger.info("Starting impact analysis", 
                       repository=request.repository, 
                       pull_request_id=request.pull_request_id)
            
            # Generate unique analysis ID
            analysis_id = str(uuid.uuid4())
            
            # Get repository info
            repo = await self._get_or_create_repository(db, request.repository)
            
            # Find related tests for changed files
            selected_tests, total_tests = await self._find_related_tests(db, request.changed_files)
            
            # Calculate metrics
            estimated_time_saved = await self._calculate_time_saved(db, selected_tests, total_tests)
            risk_score = self._calculate_risk_score(selected_tests, request.changed_files)
            confidence_score = self._calculate_confidence_score(selected_tests, request.changed_files)
            
            # Generate analysis reasoning
            analysis_reasoning = self._generate_analysis_reasoning(
                selected_tests, request.changed_files, risk_score, confidence_score
            )
            
            # Create analysis result
            analysis_result = AnalyzerResult(
                analysis_id=analysis_id,
                pull_request_id=request.pull_request_id,
                repository=request.repository,
                changed_files=[file.file_path for file in request.changed_files],
                selected_tests=[test.dict() for test in selected_tests],
                estimated_time_saved=estimated_time_saved,
                risk_score=risk_score,
                analysis_reasoning=analysis_reasoning,
                total_tests_in_repo=total_tests,
                tests_selected_count=len(selected_tests),
                confidence_score=confidence_score
            )
            
            db.add(analysis_result)
            await db.commit()
            
            # Log metrics to CloudWatch
            aws_service.put_metric("AnalysisCompleted", 1, "Count", [
                {"Name": "Repository", "Value": request.repository},
                {"Name": "AnalysisID", "Value": analysis_id}
            ])
            
            aws_service.put_metric("TestsSelected", len(selected_tests), "Count", [
                {"Name": "Repository", "Value": request.repository}
            ])
            
            aws_service.put_metric("TimeSaved", estimated_time_saved, "Minutes", [
                {"Name": "Repository", "Value": request.repository}
            ])
            
            logger.info("Impact analysis completed", 
                       analysis_id=analysis_id, 
                       tests_selected=len(selected_tests),
                       time_saved=estimated_time_saved)
            
            return AnalysisResponse(
                analysis_id=analysis_id,
                pull_request_id=request.pull_request_id,
                repository=request.repository,
                selected_tests=selected_tests,
                estimated_time_saved=estimated_time_saved,
                risk_score=risk_score,
                analysis_reasoning=analysis_reasoning,
                total_tests_in_repo=total_tests,
                tests_selected_count=len(selected_tests),
                confidence_score=confidence_score,
                created_at=analysis_result.created_at
            )
            
        except Exception as e:
            logger.error("Impact analysis failed", 
                        repository=request.repository, 
                        pull_request_id=request.pull_request_id,
                        error=str(e))
            raise
    
    async def _get_or_create_repository(self, db: AsyncSession, repo_name: str) -> Repository:
        """Get or create repository record"""
        try:
            # Parse owner/repo from repo_name
            if '/' in repo_name:
                owner, name = repo_name.split('/', 1)
            else:
                owner = "unknown"
                name = repo_name
            
            # Check if repository exists
            stmt = select(Repository).where(Repository.full_name == repo_name)
            result = await db.execute(stmt)
            repo = result.scalar_one_or_none()
            
            if not repo:
                repo = Repository(
                    name=name,
                    owner=owner,
                    full_name=repo_name,
                    default_branch="main"
                )
                db.add(repo)
                await db.commit()
                await db.refresh(repo)
            
            return repo
            
        except Exception as e:
            logger.error("Failed to get/create repository", repo_name=repo_name, error=str(e))
            raise
    
    async def _find_related_tests(self, db: AsyncSession, changed_files: List) -> Tuple[List[TestInfo], int]:
        """Find tests related to changed files"""
        try:
            selected_tests = []
            test_file_paths = set()
            
            # Get total tests count
            total_tests_stmt = select(func.count(CoverageMapping.test_file_path.distinct()))
            total_tests_result = await db.execute(total_tests_stmt)
            total_tests = total_tests_result.scalar()
            
            for changed_file in changed_files:
                # Find coverage mappings for this file
                stmt = select(CoverageMapping).where(
                    CoverageMapping.file_path == changed_file.file_path
                ).options(selectinload(CoverageMapping.test_history))
                
                result = await db.execute(stmt)
                mappings = result.scalars().all()
                
                for mapping in mappings:
                    if mapping.test_file_path not in test_file_paths:
                        # Get test execution history for this test
                        test_history = await self._get_test_history(db, mapping.id)
                        
                        # Calculate estimated execution time
                        estimated_time = self._estimate_execution_time(test_history)
                        
                        # Determine priority based on coverage and change type
                        priority = self._determine_priority(
                            mapping.coverage_percentage, 
                            changed_file.change_type,
                            estimated_time
                        )
                        
                        # Generate reason for selection
                        reason = self._generate_selection_reason(
                            mapping, changed_file, test_history
                        )
                        
                        test_info = TestInfo(
                            test_file_path=mapping.test_file_path,
                            test_function_name=mapping.test_function_name,
                            coverage_percentage=mapping.coverage_percentage,
                            estimated_execution_time=estimated_time,
                            priority=priority,
                            reason=reason
                        )
                        
                        selected_tests.append(test_info)
                        test_file_paths.add(mapping.test_file_path)
            
            # Sort tests by priority and coverage
            selected_tests.sort(key=lambda x: (
                self.risk_weights.get(x.priority, 0.5),
                x.coverage_percentage
            ), reverse=True)
            
            # Limit to top 50 tests to avoid overwhelming CI
            if len(selected_tests) > 50:
                selected_tests = selected_tests[:50]
                logger.info("Limited selected tests to top 50", 
                           total_found=len(selected_tests))
            
            return selected_tests, total_tests
            
        except Exception as e:
            logger.error("Failed to find related tests", error=str(e))
            raise
    
    async def _get_test_history(self, db: AsyncSession, coverage_mapping_id: int) -> List[TestHistory]:
        """Get test execution history for a coverage mapping"""
        try:
            stmt = select(TestHistory).where(
                TestHistory.coverage_mapping_id == coverage_mapping_id
            ).order_by(TestHistory.execution_date.desc()).limit(10)
            
            result = await db.execute(stmt)
            return result.scalars().all()
            
        except Exception as e:
            logger.error("Failed to get test history", 
                        coverage_mapping_id=coverage_mapping_id, error=str(e))
            return []
    
    def _estimate_execution_time(self, test_history: List[TestHistory]) -> float:
        """Estimate execution time based on historical data"""
        if not test_history:
            return 5.0  # Default 5 seconds for new tests
        
        # Calculate average execution time from recent runs
        recent_times = [th.execution_time for th in test_history[:5] if th.execution_time > 0]
        
        if recent_times:
            avg_time = sum(recent_times) / len(recent_times)
            # Add 20% buffer for safety
            return avg_time * 1.2
        
        return 5.0
    
    def _determine_priority(self, coverage_percentage: float, change_type: str, 
                           estimated_time: float) -> str:
        """Determine test priority based on various factors"""
        if change_type == "deleted":
            return "high"  # High priority for deleted files
        
        if coverage_percentage >= 80:
            return "high"
        elif coverage_percentage >= 50:
            return "medium"
        else:
            return "low"
    
    def _generate_selection_reason(self, mapping: CoverageMapping, changed_file, 
                                  test_history: List[TestHistory]) -> str:
        """Generate human-readable reason for test selection"""
        reasons = []
        
        if mapping.coverage_percentage > 0:
            reasons.append(f"File has {mapping.coverage_percentage:.1f}% test coverage")
        
        if changed_file.change_type == "deleted":
            reasons.append("File was deleted - high risk")
        elif changed_file.change_type == "modified":
            reasons.append("File was modified - needs validation")
        
        if test_history:
            recent_failures = sum(1 for th in test_history[:3] if th.status == "failed")
            if recent_failures > 0:
                reasons.append(f"Test failed {recent_failures} times recently")
        
        if not reasons:
            reasons.append("File is covered by this test")
        
        return "; ".join(reasons)
    
    async def _calculate_time_saved(self, db: AsyncSession, selected_tests: List[TestInfo], 
                                   total_tests: int) -> float:
        """Calculate estimated time saved by running only selected tests"""
        try:
            if total_tests == 0:
                return 0.0
            
            # Calculate time for selected tests
            selected_time = sum(test.estimated_execution_time for test in selected_tests)
            
            # Estimate time for all tests (assuming average 5 seconds per test)
            estimated_total_time = total_tests * 5.0
            
            # Time saved = total time - selected time
            time_saved = estimated_total_time - selected_time
            
            # Convert to minutes
            return max(0.0, time_saved / 60.0)
            
        except Exception as e:
            logger.error("Failed to calculate time saved", error=str(e))
            return 0.0
    
    def _calculate_risk_score(self, selected_tests: List[TestInfo], 
                             changed_files: List) -> float:
        """Calculate risk score based on test selection and changes"""
        try:
            if not selected_tests:
                return 1.0  # High risk if no tests selected
            
            # Calculate risk based on test priorities
            priority_scores = []
            for test in selected_tests:
                priority_scores.append(self.risk_weights.get(test.priority, 0.5))
            
            avg_priority_score = sum(priority_scores) / len(priority_scores)
            
            # Adjust risk based on coverage
            avg_coverage = sum(test.coverage_percentage for test in selected_tests) / len(selected_tests)
            coverage_factor = 1.0 - (avg_coverage / 100.0)
            
            # Final risk score (0.0 = low risk, 1.0 = high risk)
            risk_score = (avg_priority_score + coverage_factor) / 2.0
            
            return min(1.0, max(0.0, risk_score))
            
        except Exception as e:
            logger.error("Failed to calculate risk score", error=str(e))
            return 0.5
    
    def _calculate_confidence_score(self, selected_tests: List[TestInfo], 
                                   changed_files: List) -> float:
        """Calculate confidence in the analysis"""
        try:
            if not selected_tests:
                return 0.0
            
            # Confidence factors
            coverage_confidence = sum(test.coverage_percentage for test in selected_tests) / len(selected_tests) / 100.0
            
            # More tests = higher confidence (up to a point)
            test_count_confidence = min(len(selected_tests) / 20.0, 1.0)
            
            # File change confidence
            file_change_confidence = 1.0 if len(changed_files) <= 10 else 0.8
            
            # Weighted average
            confidence = (coverage_confidence * 0.5 + 
                         test_count_confidence * 0.3 + 
                         file_change_confidence * 0.2)
            
            return min(1.0, max(0.0, confidence))
            
        except Exception as e:
            logger.error("Failed to calculate confidence score", error=str(e))
            return 0.5
    
    def _generate_analysis_reasoning(self, selected_tests: List[TestInfo], 
                                   changed_files: List, risk_score: float, 
                                   confidence_score: float) -> str:
        """Generate human-readable analysis reasoning"""
        reasoning_parts = []
        
        reasoning_parts.append(f"Analysis of {len(changed_files)} changed files")
        reasoning_parts.append(f"Selected {len(selected_tests)} relevant tests")
        
        if selected_tests:
            high_priority = sum(1 for test in selected_tests if test.priority == "high")
            if high_priority > 0:
                reasoning_parts.append(f"{high_priority} high-priority tests selected")
        
        reasoning_parts.append(f"Risk score: {risk_score:.2f} (0.0 = low, 1.0 = high)")
        reasoning_parts.append(f"Confidence: {confidence_score:.2f} (0.0 = low, 1.0 = high)")
        
        if risk_score > 0.7:
            reasoning_parts.append("⚠️ High risk detected - consider running more tests")
        elif risk_score < 0.3:
            reasoning_parts.append("✅ Low risk - selected tests should provide good coverage")
        
        return ". ".join(reasoning_parts)


# Global analyzer instance
impact_analyzer = ImpactAnalyzer() 