from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class CoverageMapping(Base):
    """Maps files to their related tests"""
    __tablename__ = "coverage_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String(500), nullable=False, index=True)
    test_file_path = Column(String(500), nullable=False, index=True)
    test_function_name = Column(String(200), nullable=False)
    coverage_percentage = Column(Float, default=0.0)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    test_history = relationship("TestHistory", back_populates="coverage_mapping")


class TestHistory(Base):
    """Historical test execution data"""
    __tablename__ = "test_history"
    
    id = Column(Integer, primary_key=True, index=True)
    coverage_mapping_id = Column(Integer, ForeignKey("coverage_mappings.id"), nullable=False)
    test_file_path = Column(String(500), nullable=False)
    test_function_name = Column(String(200), nullable=False)
    execution_time = Column(Float, nullable=False)  # in seconds
    status = Column(String(50), nullable=False)  # passed, failed, skipped
    execution_date = Column(DateTime(timezone=True), server_default=func.now())
    test_output = Column(Text)
    error_message = Column(Text)
    
    # Relationships
    coverage_mapping = relationship("CoverageMapping", back_populates="test_history")


class AnalyzerResult(Base):
    """Results from impact analysis"""
    __tablename__ = "analyzer_results"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(100), unique=True, index=True)
    pull_request_id = Column(String(100), nullable=False, index=True)
    repository = Column(String(200), nullable=False)
    changed_files = Column(JSON, nullable=False)  # List of changed file paths
    selected_tests = Column(JSON, nullable=False)  # List of test objects
    estimated_time_saved = Column(Float, nullable=False)  # in minutes
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    analysis_reasoning = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Additional metadata
    total_tests_in_repo = Column(Integer, default=0)
    tests_selected_count = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.0)


class TestExecution(Base):
    """Records of test executions from GitHub Actions"""
    __tablename__ = "test_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(100), ForeignKey("analyzer_results.analysis_id"), nullable=False)
    workflow_run_id = Column(String(100), nullable=False, index=True)
    test_file_path = Column(String(500), nullable=False)
    test_function_name = Column(String(200), nullable=False)
    execution_time = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    logs_url = Column(String(500))
    artifacts_url = Column(String(500))
    
    # Relationships
    analyzer_result = relationship("AnalyzerResult")


class Repository(Base):
    """Repository information for tracking"""
    __tablename__ = "repositories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    owner = Column(String(200), nullable=False)
    full_name = Column(String(400), nullable=False, unique=True)
    default_branch = Column(String(100), default="main")
    language = Column(String(100))
    total_tests = Column(Integer, default=0)
    last_analysis = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) 