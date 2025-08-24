import boto3
import json
import logging
from typing import Dict, Any, Optional, List
from botocore.exceptions import ClientError, NoCredentialsError
from ..config import settings
import structlog

logger = structlog.get_logger()


class AWSService:
    """Service class for AWS operations"""
    
    def __init__(self):
        self.region = settings.AWS_REGION
        self.session = boto3.Session(
            region_name=self.region,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        # Initialize AWS clients
        self.s3_client = self.session.client('s3')
        self.cloudwatch_client = self.session.client('cloudwatch')
        self.cloudwatch_logs_client = self.session.client('logs')
        self.rds_client = self.session.client('rds')
        
        # S3 bucket configuration
        self.s3_bucket = settings.S3_BUCKET_NAME
        
        # CloudWatch configuration
        self.log_group = settings.CLOUDWATCH_LOG_GROUP
        self.log_stream = settings.CLOUDWATCH_LOG_STREAM
        
        # Ensure S3 bucket exists
        self._ensure_s3_bucket_exists()
    
    def _ensure_s3_bucket_exists(self):
        """Ensure S3 bucket exists, create if it doesn't"""
        try:
            self.s3_client.head_bucket(Bucket=self.s3_bucket)
            logger.info("S3 bucket exists", bucket=self.s3_bucket)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                try:
                    self.s3_client.create_bucket(
                        Bucket=self.s3_bucket,
                        CreateBucketConfiguration={'LocationConstraint': self.region}
                    )
                    logger.info("Created S3 bucket", bucket=self.s3_bucket)
                except ClientError as create_error:
                    logger.error("Failed to create S3 bucket", 
                               bucket=self.s3_bucket, error=str(create_error))
            else:
                logger.error("Error checking S3 bucket", bucket=self.s3_bucket, error=str(e))
    
    def upload_coverage_report(self, analysis_id: str, report_data: Dict[str, Any], 
                             file_extension: str = "json") -> str:
        """Upload coverage report to S3"""
        try:
            key = f"coverage-reports/{analysis_id}/report.{file_extension}"
            
            if file_extension == "json":
                content = json.dumps(report_data, indent=2)
                content_type = "application/json"
            else:
                content = report_data
                content_type = "text/plain"
            
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=key,
                Body=content,
                ContentType=content_type,
                Metadata={
                    'analysis_id': analysis_id,
                    'uploaded_at': str(json.dumps({'timestamp': 'now'}))
                }
            )
            
            url = f"https://{self.s3_bucket}.s3.{self.region}.amazonaws.com/{key}"
            logger.info("Uploaded coverage report to S3", 
                       analysis_id=analysis_id, url=url)
            
            return url
            
        except Exception as e:
            logger.error("Failed to upload coverage report", 
                        analysis_id=analysis_id, error=str(e))
            raise
    
    def upload_test_artifacts(self, analysis_id: str, workflow_run_id: str, 
                             artifacts: Dict[str, Any]) -> str:
        """Upload test execution artifacts to S3"""
        try:
            key = f"test-artifacts/{analysis_id}/{workflow_run_id}/artifacts.json"
            
            self.s3_client.put_object(
                Bucket=self.s3_bucket,
                Key=key,
                Body=json.dumps(artifacts, indent=2),
                ContentType="application/json",
                Metadata={
                    'analysis_id': analysis_id,
                    'workflow_run_id': workflow_run_id,
                    'uploaded_at': str(json.dumps({'timestamp': 'now'}))
                }
            )
            
            url = f"https://{self.s3_bucket}.s3.{self.region}.amazonaws.com/{key}"
            logger.info("Uploaded test artifacts to S3", 
                       analysis_id=analysis_id, workflow_run_id=workflow_run_id, url=url)
            
            return url
            
        except Exception as e:
            logger.error("Failed to upload test artifacts", 
                        analysis_id=analysis_id, workflow_run_id=workflow_run_id, error=str(e))
            raise
    
    def log_to_cloudwatch(self, message: str, log_level: str = "INFO", 
                          additional_data: Optional[Dict[str, Any]] = None):
        """Log message to CloudWatch"""
        try:
            log_data = {
                'message': message,
                'level': log_level,
                'timestamp': str(json.dumps({'timestamp': 'now'})),
                'service': 'impact-analyzer-backend'
            }
            
            if additional_data:
                log_data.update(additional_data)
            
            log_event = {
                'timestamp': int(json.dumps({'timestamp': 'now'}) * 1000),
                'message': json.dumps(log_data)
            }
            
            self.cloudwatch_logs_client.put_log_events(
                logGroupName=self.log_group,
                logStreamName=self.log_stream,
                logEvents=[log_event]
            )
            
        except Exception as e:
            logger.error("Failed to log to CloudWatch", error=str(e))
    
    def put_metric(self, metric_name: str, value: float, unit: str = "Count",
                   dimensions: Optional[List[Dict[str, str]]] = None):
        """Put custom metric to CloudWatch"""
        try:
            metric_data = {
                'MetricName': metric_name,
                'Value': value,
                'Unit': unit,
                'Timestamp': json.dumps({'timestamp': 'now'}),
                'Namespace': 'ImpactAnalyzer'
            }
            
            if dimensions:
                metric_data['Dimensions'] = dimensions
            
            self.cloudwatch_client.put_metric_data(
                Namespace='ImpactAnalyzer',
                MetricData=[metric_data]
            )
            
            logger.info("Put metric to CloudWatch", 
                       metric_name=metric_name, value=value, unit=unit)
            
        except Exception as e:
            logger.error("Failed to put metric to CloudWatch", 
                        metric_name=metric_name, error=str(e))
    
    def check_aws_services_health(self) -> Dict[str, str]:
        """Check health of AWS services"""
        health_status = {}
        
        # Check S3
        try:
            self.s3_client.head_bucket(Bucket=self.s3_bucket)
            health_status['s3'] = 'healthy'
        except Exception:
            health_status['s3'] = 'unhealthy'
        
        # Check CloudWatch
        try:
            self.cloudwatch_client.list_metrics(Namespace='AWS/EC2', MaxResults=1)
            health_status['cloudwatch'] = 'healthy'
        except Exception:
            health_status['cloudwatch'] = 'unhealthy'
        
        # Check CloudWatch Logs
        try:
            self.cloudwatch_logs_client.describe_log_groups(logGroupNamePrefix=self.log_group, limit=1)
            health_status['cloudwatch_logs'] = 'healthy'
        except Exception:
            health_status['cloudwatch_logs'] = 'unhealthy'
        
        return health_status
    
    def get_s3_url(self, key: str) -> str:
        """Generate S3 URL for a given key"""
        return f"https://{self.s3_bucket}.s3.{self.region}.amazonaws.com/{key}"
    
    def delete_old_artifacts(self, days_old: int = 30):
        """Delete old artifacts from S3 (cleanup)"""
        try:
            # This is a simplified version - in production you might want to use lifecycle policies
            logger.info("Cleanup of old artifacts not implemented - use S3 lifecycle policies")
        except Exception as e:
            logger.error("Failed to cleanup old artifacts", error=str(e))


# Global AWS service instance
aws_service = AWSService() 