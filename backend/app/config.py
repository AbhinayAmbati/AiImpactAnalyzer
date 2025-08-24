import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/impact_analyzer")
    
    # AWS Configuration
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    
    # S3 Configuration
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "impact-analyzer-reports")
    
    # RDS Configuration
    RDS_HOST: str = os.getenv("RDS_HOST", "localhost")
    RDS_PORT: int = int(os.getenv("RDS_PORT", "5432"))
    RDS_DATABASE: str = os.getenv("RDS_DATABASE", "impact_analyzer")
    RDS_USERNAME: str = os.getenv("RDS_USERNAME", "postgres")
    RDS_PASSWORD: str = os.getenv("RDS_PASSWORD", "password")
    
    # Application Configuration
    APP_NAME: str = "AI Driven Impact Analyzer"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # GitHub Configuration
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN")
    GITHUB_WEBHOOK_SECRET: Optional[str] = os.getenv("GITHUB_WEBHOOK_SECRET")
    
    # CloudWatch Configuration
    CLOUDWATCH_LOG_GROUP: str = os.getenv("CLOUDWATCH_LOG_GROUP", "/aws/ecs/impact-analyzer")
    CLOUDWATCH_LOG_STREAM: str = os.getenv("CLOUDWATCH_LOG_STREAM", "backend")
    
    class Config:
        env_file = ".env"


settings = Settings()


def get_database_url() -> str:
    """Construct database URL from individual components"""
    if os.getenv("DATABASE_URL"):
        return os.getenv("DATABASE_URL")
    
    return f"postgresql://{settings.RDS_USERNAME}:{settings.RDS_PASSWORD}@{settings.RDS_HOST}:{settings.RDS_PORT}/{settings.RDS_DATABASE}" 