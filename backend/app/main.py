from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import structlog
import time
from contextlib import asynccontextmanager

from .api.endpoints import router
from .database import init_db, close_db
from .config import settings
from .services.aws_service import aws_service

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting AI Driven Impact Analyzer", version=settings.APP_VERSION)
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")
        
        # Log startup to CloudWatch
        aws_service.log_to_cloudwatch(
            f"Application started - version {settings.APP_VERSION}",
            "INFO",
            {"service": "impact-analyzer-backend", "version": settings.APP_VERSION}
        )
        
        yield
        
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        raise
    finally:
        # Shutdown
        logger.info("Shutting down AI Driven Impact Analyzer")
        await close_db()
        
        # Log shutdown to CloudWatch
        aws_service.log_to_cloudwatch(
            "Application shutting down",
            "INFO",
            {"service": "impact-analyzer-backend"}
        )


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-driven impact analyzer for intelligent test selection in CI/CD pipelines",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log request metrics to CloudWatch
    try:
        aws_service.put_metric("RequestDuration", process_time, "Seconds", [
            {"Name": "Endpoint", "Value": request.url.path},
            {"Name": "Method", "Value": request.method}
        ])
        
        aws_service.put_metric("RequestCount", 1, "Count", [
            {"Name": "Endpoint", "Value": request.url.path},
            {"Name": "Method", "Value": request.method}
        ])
    except Exception as e:
        logger.warning("Failed to log metrics to CloudWatch", error=str(e))
    
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error("Unhandled exception", 
                path=request.url.path,
                method=request.method,
                error=str(exc),
                exc_info=True)
    
    # Log error to CloudWatch
    try:
        aws_service.log_to_cloudwatch(
            f"Unhandled exception: {str(exc)}",
            "ERROR",
            {
                "path": str(request.url.path),
                "method": request.method,
                "error": str(exc)
            }
        )
    except Exception as e:
        logger.warning("Failed to log error to CloudWatch", error=str(e))
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred",
            "timestamp": time.time()
        }
    )


# Include API routes
app.include_router(router, prefix="/api/v1", tags=["api"])


@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "message": "AI Driven Impact Analyzer API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health"
    }


@app.get("/ping", tags=["health"])
async def ping():
    """Simple health check endpoint"""
    return {"status": "ok", "timestamp": time.time()}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    ) 