#!/usr/bin/env python3
"""
AI Driven Impact Analyzer - AWS CDK Infrastructure
"""

import aws_cdk as cdk
from aws_cdk import (
    Stack,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_rds as rds,
    aws_s3 as s3,
    aws_apigateway as apigateway,
    aws_ec2 as ec2,
    aws_logs as logs,
    aws_iam as iam,
    aws_secretsmanager as secretsmanager,
    Duration,
    RemovalPolicy,
    CfnOutput,
)
from constructs import Construct


class ImpactAnalyzerStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # VPC for the application
        vpc = ec2.Vpc(
            self, "ImpactAnalyzerVPC",
            max_azs=2,
            nat_gateways=1,
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="public",
                    subnet_type=ec2.SubnetType.PUBLIC,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="private",
                    subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidr_mask=24
                ),
                ec2.SubnetConfiguration(
                    name="isolated",
                    subnet_type=ec2.SubnetType.PRIVATE_ISOLATED,
                    cidr_mask=24
                )
            ]
        )

        # Security Group for RDS
        rds_security_group = ec2.SecurityGroup(
            self, "RDSSecurityGroup",
            vpc=vpc,
            description="Security group for RDS instance",
            allow_all_outbound=False
        )
        rds_security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(5432),
            description="Allow PostgreSQL access from ECS tasks"
        )

        # RDS PostgreSQL Instance
        db_credentials = rds.Credentials.from_generated_secret(
            "postgres",
            secret_name="impact-analyzer-db-credentials"
        )

        database = rds.DatabaseInstance(
            self, "ImpactAnalyzerDatabase",
            engine=rds.DatabaseInstanceEngine.postgres(
                version=rds.PostgresEngineVersion.VER_15_4
            ),
            instance_type=ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.MICRO
            ),
            credentials=db_credentials,
            database_name="impact_analyzer",
            vpc=vpc,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_ISOLATED
            ),
            security_groups=[rds_security_group],
            backup_retention=Duration.days(7),
            deletion_protection=False,
            removal_policy=RemovalPolicy.DESTROY,
            storage_encrypted=True,
            monitoring_interval=Duration.minutes(1),
            enable_performance_insights=True
        )

        # S3 Bucket for reports and artifacts
        s3_bucket = s3.Bucket(
            self, "ImpactAnalyzerBucket",
            bucket_name=f"impact-analyzer-reports-{self.account}",
            versioned=True,
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            lifecycle_rules=[
                s3.LifecycleRule(
                    id="cleanup-old-artifacts",
                    enabled=True,
                    expiration=Duration.days(90),
                    transitions=[
                        s3.Transition(
                            storage_class=s3.StorageClass.INFREQUENT_ACCESS,
                            transition_after=Duration.days(30)
                        ),
                        s3.Transition(
                            storage_class=s3.StorageClass.GLACIER,
                            transition_after=Duration.days(60)
                        )
                    ]
                )
            ]
        )

        # CloudWatch Log Group
        log_group = logs.LogGroup(
            self, "ImpactAnalyzerLogGroup",
            log_group_name="/aws/ecs/impact-analyzer",
            retention=logs.RetentionDays.ONE_MONTH,
            removal_policy=RemovalPolicy.DESTROY
        )

        # ECS Cluster
        cluster = ecs.Cluster(
            self, "ImpactAnalyzerCluster",
            vpc=vpc,
            container_insights=True,
            default_cloud_map_namespace_name="impact-analyzer.local"
        )

        # Task Definition
        task_definition = ecs.FargateTaskDefinition(
            self, "ImpactAnalyzerTask",
            memory_limit_mib=1024,
            cpu=512,
            execution_role=self._create_execution_role(s3_bucket, log_group),
            task_role=self._create_task_role(s3_bucket, database)
        )

        # Container Definition
        container = task_definition.add_container(
            "ImpactAnalyzerContainer",
            image=ecs.ContainerImage.from_asset("../backend"),
            logging=ecs.LogDrivers.aws_logs(
                log_group=log_group,
                stream_prefix="backend"
            ),
            environment={
                "DATABASE_URL": database.instance_endpoint.hostname,
                "RDS_HOST": database.instance_endpoint.hostname,
                "RDS_PORT": "5432",
                "RDS_DATABASE": "impact_analyzer",
                "S3_BUCKET_NAME": s3_bucket.bucket_name,
                "AWS_REGION": self.region,
                "CLOUDWATCH_LOG_GROUP": log_group.log_group_name,
                "CLOUDWATCH_LOG_STREAM": "backend"
            },
            secrets={
                "RDS_USERNAME": ecs.Secret.from_secrets_manager(
                    database.secret,
                    field="username"
                ),
                "RDS_PASSWORD": ecs.Secret.from_secrets_manager(
                    database.secret,
                    field="password"
                )
            },
            health_check=ecs.HealthCheck(
                command=["CMD-SHELL", "curl -f http://localhost:8000/ping || exit 1"],
                interval=Duration.seconds(30),
                timeout=Duration.seconds(5),
                retries=3,
                start_period=Duration.seconds(60)
            )
        )

        container.add_port_mappings(
            ecs.PortMapping(container_port=8000)
        )

        # ECS Service
        service = ecs.FargateService(
            self, "ImpactAnalyzerService",
            cluster=cluster,
            task_definition=task_definition,
            desired_count=2,
            min_healthy_percent=50,
            max_healthy_percent=200,
            vpc_subnets=ec2.SubnetSelection(
                subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS
            ),
            security_groups=[self._create_service_security_group(vpc)],
            service_name="impact-analyzer-backend"
        )

        # Auto Scaling
        scaling = service.auto_scale_task_count(
            min_capacity=2,
            max_capacity=10
        )

        scaling.scale_on_cpu_utilization(
            "CpuScaling",
            target_utilization_percent=70,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60)
        )

        scaling.scale_on_memory_utilization(
            "MemoryScaling",
            target_utilization_percent=80,
            scale_in_cooldown=Duration.seconds(60),
            scale_out_cooldown=Duration.seconds(60)
        )

        # API Gateway
        api = apigateway.RestApi(
            self, "ImpactAnalyzerAPI",
            rest_api_name="Impact Analyzer API",
            description="API Gateway for AI Driven Impact Analyzer",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS,
                allow_headers=["*"]
            ),
            deploy_options=apigateway.StageOptions(
                stage_name="prod",
                logging_level=apigateway.MethodLoggingLevel.INFO,
                data_trace_enabled=True,
                metrics_enabled=True
            )
        )

        # API Gateway Integration
        integration = apigateway.Integration(
            type=apigateway.IntegrationType.HTTP_PROXY,
            integration_http_method="POST",
            options=apigateway.IntegrationOptions(
                connection_type=apigateway.ConnectionType.VPC_LINK,
                vpc_link=apigateway.VpcLink(
                    self, "VPCLink",
                    vpc=vpc,
                    targets=[service]
                )
            )
        )

        # API Resources and Methods
        api_resource = api.root.add_resource("api").add_resource("v1")
        
        # Analyze endpoint
        analyze_resource = api_resource.add_resource("analyze")
        analyze_resource.add_method(
            "POST",
            integration=integration,
            authorization_type=apigateway.AuthorizationType.NONE,
            request_parameters={
                "method.request.header.Content-Type": True
            }
        )

        # Health check endpoint
        health_resource = api_resource.add_resource("health")
        health_resource.add_method(
            "GET",
            integration=integration,
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Other endpoints
        execute_tests_resource = api_resource.add_resource("execute-tests")
        execute_tests_resource.add_method(
            "POST",
            integration=integration,
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Outputs
        CfnOutput(
            self, "APIEndpoint",
            value=api.url,
            description="API Gateway endpoint URL"
        )

        CfnOutput(
            self, "DatabaseEndpoint",
            value=database.instance_endpoint.hostname,
            description="RDS PostgreSQL endpoint"
        )

        CfnOutput(
            self, "S3BucketName",
            value=s3_bucket.bucket_name,
            description="S3 bucket for reports and artifacts"
        )

        CfnOutput(
            self, "ECSClusterName",
            value=cluster.cluster_name,
            description="ECS cluster name"
        )

    def _create_execution_role(self, s3_bucket: s3.Bucket, log_group: logs.LogGroup) -> iam.Role:
        """Create ECS execution role"""
        role = iam.Role(
            self, "ImpactAnalyzerExecutionRole",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AmazonECSTaskExecutionRolePolicy")
            ]
        )

        # Add permissions for CloudWatch Logs
        log_group.grant_write(role)

        return role

    def _create_task_role(self, s3_bucket: s3.Bucket, database: rds.DatabaseInstance) -> iam.Role:
        """Create ECS task role"""
        role = iam.Role(
            self, "ImpactAnalyzerTaskRole",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com")
        )

        # S3 permissions
        s3_bucket.grant_read_write(role)

        # CloudWatch permissions
        role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=[
                    "cloudwatch:PutMetricData",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                resources=["*"]
            )
        )

        return role

    def _create_service_security_group(self, vpc: ec2.Vpc) -> ec2.SecurityGroup:
        """Create security group for ECS service"""
        security_group = ec2.SecurityGroup(
            self, "ECSServiceSecurityGroup",
            vpc=vpc,
            description="Security group for ECS service",
            allow_all_outbound=True
        )

        security_group.add_ingress_rule(
            peer=ec2.Peer.any_ipv4(),
            connection=ec2.Port.tcp(8000),
            description="Allow HTTP access to backend service"
        )

        return security_group


def main():
    app = cdk.App()
    
    ImpactAnalyzerStack(
        app, "ImpactAnalyzerStack",
        env=cdk.Environment(
            account=app.node.try_get_context("account"),
            region=app.node.try_get_context("region") or "us-east-1"
        )
    )
    
    app.synth()


if __name__ == "__main__":
    main() 