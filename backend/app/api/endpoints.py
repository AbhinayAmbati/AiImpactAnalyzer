from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import structlog

from ..database import get_db
from ..schemas import (
    AnalysisRequest, AnalysisResponse, TestExecutionRequest, TestExecutionResponse,
    HealthCheckResponse, CoverageMappingRequest, RepositoryRequest
)
from ..services.impact_analyzer import impact_analyzer
from ..services.aws_service import aws_service
from ..models import CoverageMapping, Repository
from ..config import settings

logger = structlog.get_logger()

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_impact(
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze the impact of changed files and select relevant tests to run.
    
    This endpoint accepts a list of changed files from a Pull Request and returns:
    - Selected tests to run
    - Estimated time saved
    - Risk score
    - Analysis reasoning
    """
    try:
        logger.info("Received analysis request", 
                   repository=request.repository, 
                   pull_request_id=request.pull_request_id,
                   files_count=len(request.changed_files))
        
        # Validate request
        if not request.changed_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one changed file must be provided"
            )
        
        # Perform impact analysis
        result = await impact_analyzer.analyze_impact(db, request)
        
        # Log to CloudWatch
        aws_service.log_to_cloudwatch(
            f"Impact analysis completed for PR {request.pull_request_id}",
            "INFO",
            {
                "repository": request.repository,
                "pull_request_id": request.pull_request_id,
                "tests_selected": len(result.selected_tests),
                "time_saved": result.estimated_time_saved
            }
        )
        
        return result
        
    except Exception as e:
        logger.error("Analysis endpoint error", 
                    repository=request.repository, 
                    pull_request_id=request.pull_request_id,
                    error=str(e))
        
        # Log error to CloudWatch
        aws_service.log_to_cloudwatch(
            f"Analysis failed for PR {request.pull_request_id}: {str(e)}",
            "ERROR",
            {
                "repository": request.repository,
                "pull_request_id": request.pull_request_id,
                "error": str(e)
            }
        )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/execute-tests", response_model=TestExecutionResponse)
async def execute_tests(
    request: TestExecutionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute selected tests and track execution results.
    This endpoint is called by GitHub Actions workflows.
    """
    try:
        logger.info("Received test execution request", 
                   analysis_id=request.analysis_id,
                   workflow_run_id=request.workflow_run_id)
        
        # For now, return a mock response
        # In production, this would trigger test execution and track results
        response = TestExecutionResponse(
            execution_id=f"exec_{request.workflow_run_id}",
            workflow_run_id=request.workflow_run_id,
            status="scheduled",
            total_tests=len(request.tests_to_run),
            completed_tests=0,
            passed_tests=0,
            failed_tests=0,
            skipped_tests=0,
            total_execution_time=0.0
        )
        
        # Log to CloudWatch
        aws_service.log_to_cloudwatch(
            f"Test execution scheduled for analysis {request.analysis_id}",
            "INFO",
            {
                "analysis_id": request.analysis_id,
                "workflow_run_id": request.workflow_run_id,
                "tests_count": len(request.tests_to_run)
            }
        )
        
        return response
        
    except Exception as e:
        logger.error("Test execution endpoint error", 
                    analysis_id=request.analysis_id,
                    error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test execution failed: {str(e)}"
        )


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint for monitoring and load balancer health checks.
    """
    try:
        # Check AWS services health
        aws_services_status = aws_service.check_aws_services_health()
        
        # For now, assume database is healthy (in production, you'd check connection)
        database_status = "healthy"
        
        response = HealthCheckResponse(
            status="healthy",
            timestamp=aws_service.log_to_cloudwatch("Health check", "INFO"),
            version=settings.APP_VERSION,
            database_status=database_status,
            aws_services_status=aws_services_status
        )
        
        return response
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Health check failed: {str(e)}"
        )


@router.post("/coverage-mappings")
async def create_coverage_mapping(
    request: CoverageMappingRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new coverage mapping between a source file and a test.
    """
    try:
        # Check if mapping already exists
        existing = await db.execute(
            db.query(CoverageMapping).filter(
                CoverageMapping.file_path == request.file_path,
                CoverageMapping.test_file_path == request.test_file_path,
                CoverageMapping.test_function_name == request.test_function_name
            ).first()
        )
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Coverage mapping already exists"
            )
        
        # Create new mapping
        mapping = CoverageMapping(
            file_path=request.file_path,
            test_file_path=request.test_file_path,
            test_function_name=request.test_function_name,
            coverage_percentage=request.coverage_percentage
        )
        
        db.add(mapping)
        await db.commit()
        await db.refresh(mapping)
        
        logger.info("Created coverage mapping", 
                   file_path=request.file_path,
                   test_file_path=request.test_file_path)
        
        return {"id": mapping.id, "message": "Coverage mapping created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create coverage mapping", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create coverage mapping: {str(e)}"
        )


@router.get("/coverage-mappings")
async def get_coverage_mappings(
    file_path: str = None,
    test_file_path: str = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get coverage mappings with optional filtering.
    """
    try:
        query = db.query(CoverageMapping)
        
        if file_path:
            query = query.filter(CoverageMapping.file_path == file_path)
        
        if test_file_path:
            query = query.filter(CoverageMapping.test_file_path == test_file_path)
        
        mappings = await db.execute(query.all())
        
        return [{
            "id": m.id,
            "file_path": m.file_path,
            "test_file_path": m.test_file_path,
            "test_function_name": m.test_function_name,
            "coverage_percentage": m.coverage_percentage,
            "last_updated": m.last_updated
        } for m in mappings]
        
    except Exception as e:
        logger.error("Failed to get coverage mappings", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get coverage mappings: {str(e)}"
        )


@router.post("/repositories")
async def create_repository(
    request: RepositoryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new repository record.
    """
    try:
        # Check if repository already exists
        existing = await db.execute(
            db.query(Repository).filter(
                Repository.full_name == f"{request.owner}/{request.name}"
            ).first()
        )
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Repository already exists"
            )
        
        # Create new repository
        repo = Repository(
            name=request.name,
            owner=request.owner,
            full_name=f"{request.owner}/{request.name}",
            default_branch=request.default_branch,
            language=request.language
        )
        
        db.add(repo)
        await db.commit()
        await db.refresh(repo)
        
        logger.info("Created repository", 
                   owner=request.owner,
                   name=request.name)
        
        return {"id": repo.id, "message": "Repository created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create repository", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create repository: {str(e)}"
        )


@router.get("/repositories")
async def get_repositories(db: AsyncSession = Depends(get_db)):
    """
    Get all repositories.
    """
    try:
        repos = await db.execute(db.query(Repository).all())
        
        return [{
            "id": r.id,
            "name": r.name,
            "owner": r.owner,
            "full_name": r.full_name,
            "default_branch": r.default_branch,
            "language": r.language,
            "total_tests": r.total_tests,
            "last_analysis": r.last_analysis
        } for r in repos]
        
    except Exception as e:
        logger.error("Failed to get repositories", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get repositories: {str(e)}"
        )


@router.get("/metrics")
async def get_metrics():
    """
    Get application metrics for monitoring.
    """
    try:
        # This would typically query the database for metrics
        # For now, return basic metrics
        metrics = {
            "total_analyses": 0,  # Would query AnalyzerResult count
            "total_repositories": 0,  # Would query Repository count
            "total_coverage_mappings": 0,  # Would query CoverageMapping count
            "average_time_saved": 0.0,  # Would calculate from AnalyzerResult
            "average_risk_score": 0.0  # Would calculate from AnalyzerResult
        }
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        ) 