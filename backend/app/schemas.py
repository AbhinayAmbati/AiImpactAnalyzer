from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ChangedFile(BaseModel):
    """Represents a changed file in a pull request"""
    file_path: str = Field(..., description="Path to the changed file")
    change_type: str = Field(..., description="Type of change: added, modified, deleted")
    lines_changed: Optional[int] = Field(None, description="Number of lines changed")


class AnalysisRequest(BaseModel):
    """Request model for impact analysis"""
    repository: str = Field(..., description="Repository name (owner/repo)")
    pull_request_id: str = Field(..., description="Pull request ID or number")
    changed_files: List[ChangedFile] = Field(..., description="List of changed files")
    base_branch: str = Field("main", description="Base branch for the PR")
    head_branch: str = Field(..., description="Head branch of the PR")
    commit_sha: Optional[str] = Field(None, description="Commit SHA for analysis")


class TestInfo(BaseModel):
    """Information about a test"""
    test_file_path: str = Field(..., description="Path to the test file")
    test_function_name: str = Field(..., description="Name of the test function")
    coverage_percentage: float = Field(..., description="Coverage percentage for this test")
    estimated_execution_time: float = Field(..., description="Estimated execution time in seconds")
    priority: str = Field(..., description="Test priority: high, medium, low")
    reason: str = Field(..., description="Reason why this test was selected")


class AnalysisResponse(BaseModel):
    """Response model for impact analysis"""
    analysis_id: str = Field(..., description="Unique identifier for this analysis")
    pull_request_id: str = Field(..., description="Pull request ID")
    repository: str = Field(..., description="Repository name")
    selected_tests: List[TestInfo] = Field(..., description="List of selected tests")
    estimated_time_saved: float = Field(..., description="Estimated time saved in minutes")
    risk_score: float = Field(..., description="Risk score from 0.0 to 1.0")
    analysis_reasoning: str = Field(..., description="Detailed reasoning for test selection")
    total_tests_in_repo: int = Field(..., description="Total number of tests in repository")
    tests_selected_count: int = Field(..., description="Number of tests selected")
    confidence_score: float = Field(..., description="Confidence in the analysis (0.0 to 1.0)")
    created_at: datetime = Field(..., description="When the analysis was created")


class TestExecutionRequest(BaseModel):
    """Request model for test execution"""
    analysis_id: str = Field(..., description="Analysis ID to execute tests for")
    workflow_run_id: str = Field(..., description="GitHub Actions workflow run ID")
    tests_to_run: List[TestInfo] = Field(..., description="Tests to execute")


class TestExecutionResponse(BaseModel):
    """Response model for test execution"""
    execution_id: str = Field(..., description="Unique execution identifier")
    workflow_run_id: str = Field(..., description="GitHub Actions workflow run ID")
    status: str = Field(..., description="Execution status")
    total_tests: int = Field(..., description="Total tests to execute")
    completed_tests: int = Field(..., description="Number of completed tests")
    passed_tests: int = Field(..., description="Number of passed tests")
    failed_tests: int = Field(..., description="Number of failed tests")
    skipped_tests: int = Field(..., description="Number of skipped tests")
    total_execution_time: float = Field(..., description="Total execution time in seconds")
    logs_url: Optional[str] = Field(None, description="URL to execution logs")
    artifacts_url: Optional[str] = Field(None, description="URL to execution artifacts")


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(..., description="Current timestamp")
    version: str = Field(..., description="Application version")
    database_status: str = Field(..., description="Database connection status")
    aws_services_status: Dict[str, str] = Field(..., description="AWS services status")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(..., description="When the error occurred")
    request_id: Optional[str] = Field(None, description="Request identifier for tracking")


class CoverageMappingRequest(BaseModel):
    """Request model for creating coverage mappings"""
    file_path: str = Field(..., description="Path to the source file")
    test_file_path: str = Field(..., description="Path to the test file")
    test_function_name: str = Field(..., description="Name of the test function")
    coverage_percentage: float = Field(..., description="Coverage percentage")


class RepositoryRequest(BaseModel):
    """Request model for repository operations"""
    name: str = Field(..., description="Repository name")
    owner: str = Field(..., description="Repository owner")
    default_branch: str = Field("main", description="Default branch")
    language: Optional[str] = Field(None, description="Primary programming language") 