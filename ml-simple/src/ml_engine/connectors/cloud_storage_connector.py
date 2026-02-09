"""
Cloud Storage Connectors
Supports S3, GCS, Azure Blob Storage
"""
import pandas as pd
from typing import Dict, Any
from io import BytesIO
from .base import DataConnector, ConnectionConfig


class S3Connector(DataConnector):
    """Connector for AWS S3"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.s3_client = None
        self.bucket = config.connection_params.get('bucket')
        self.key = config.query_or_path
        self.region = config.connection_params.get('region', 'us-east-1')
        
    def connect(self) -> bool:
        """Establish S3 connection"""
        try:
            import boto3
            
            aws_access_key = self.config.connection_params.get('aws_access_key_id')
            aws_secret_key = self.config.connection_params.get('aws_secret_access_key')
            
            if aws_access_key and aws_secret_key:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key,
                    region_name=self.region
                )
            else:
                # Use default credentials (IAM role, environment vars, etc.)
                self.s3_client = boto3.client('s3', region_name=self.region)
            
            return True
        except ImportError:
            raise RuntimeError("boto3 not installed. Install with: pip install boto3")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to S3: {str(e)}")
    
    def disconnect(self):
        """Close S3 connection"""
        self.s3_client = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test S3 connection and file access"""
        try:
            self.connect()
            # Try to get object metadata
            response = self.s3_client.head_object(Bucket=self.bucket, Key=self.key)
            return {
                'status': 'success',
                'message': 'Successfully connected to S3',
                'bucket': self.bucket,
                'key': self.key,
                'size_bytes': response.get('ContentLength'),
                'last_modified': str(response.get('LastModified'))
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from S3"""
        if not self.s3_client:
            self.connect()
        
        try:
            # Get object from S3
            response = self.s3_client.get_object(Bucket=self.bucket, Key=self.key)
            content = response['Body'].read()
            
            # Determine file type and read accordingly
            if self.key.endswith('.csv'):
                df = pd.read_csv(BytesIO(content))
            elif self.key.endswith('.parquet'):
                df = pd.read_parquet(BytesIO(content))
            elif self.key.endswith('.json'):
                df = pd.read_json(BytesIO(content))
            else:
                # Default to CSV
                df = pd.read_csv(BytesIO(content))
            
            # Apply sample size if specified
            if self.config.sample_size and len(df) > self.config.sample_size:
                df = df.sample(n=self.config.sample_size, random_state=42)
            
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from S3: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """Get schema information"""
        df = self.preview_data(100)
        return {
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'nullable': {col: df[col].isnull().any() for col in df.columns}
        }
    
    def preview_data(self, n_rows: int = 10) -> pd.DataFrame:
        """Preview first n rows"""
        df = self.load_data()
        return df.head(n_rows)


class GCSConnector(DataConnector):
    """Connector for Google Cloud Storage"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.storage_client = None
        self.bucket_name = config.connection_params.get('bucket')
        self.blob_name = config.query_or_path
        
    def connect(self) -> bool:
        """Establish GCS connection"""
        try:
            from google.cloud import storage
            
            project_id = self.config.connection_params.get('project_id')
            credentials_path = self.config.connection_params.get('credentials_path')
            
            if credentials_path:
                import os
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
            
            self.storage_client = storage.Client(project=project_id)
            return True
        except ImportError:
            raise RuntimeError("google-cloud-storage not installed. Install with: pip install google-cloud-storage")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to GCS: {str(e)}")
    
    def disconnect(self):
        """Close GCS connection"""
        self.storage_client = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test GCS connection and file access"""
        try:
            self.connect()
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob(self.blob_name)
            
            if blob.exists():
                return {
                    'status': 'success',
                    'message': 'Successfully connected to GCS',
                    'bucket': self.bucket_name,
                    'blob': self.blob_name,
                    'size_bytes': blob.size,
                    'updated': str(blob.updated)
                }
            else:
                return {
                    'status': 'error',
                    'message': f'Blob not found: {self.blob_name}'
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from GCS"""
        if not self.storage_client:
            self.connect()
        
        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob(self.blob_name)
            content = blob.download_as_bytes()
            
            # Determine file type and read accordingly
            if self.blob_name.endswith('.csv'):
                df = pd.read_csv(BytesIO(content))
            elif self.blob_name.endswith('.parquet'):
                df = pd.read_parquet(BytesIO(content))
            elif self.blob_name.endswith('.json'):
                df = pd.read_json(BytesIO(content))
            else:
                df = pd.read_csv(BytesIO(content))
            
            # Apply sample size if specified
            if self.config.sample_size and len(df) > self.config.sample_size:
                df = df.sample(n=self.config.sample_size, random_state=42)
            
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from GCS: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """Get schema information"""
        df = self.preview_data(100)
        return {
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'nullable': {col: df[col].isnull().any() for col in df.columns}
        }
    
    def preview_data(self, n_rows: int = 10) -> pd.DataFrame:
        """Preview first n rows"""
        df = self.load_data()
        return df.head(n_rows)


class AzureBlobConnector(DataConnector):
    """Connector for Azure Blob Storage"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.blob_service_client = None
        self.container_name = config.connection_params.get('container')
        self.blob_name = config.query_or_path
        
    def connect(self) -> bool:
        """Establish Azure Blob connection"""
        try:
            from azure.storage.blob import BlobServiceClient
            
            connection_string = self.config.connection_params.get('connection_string')
            account_url = self.config.connection_params.get('account_url')
            
            if connection_string:
                self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
            elif account_url:
                self.blob_service_client = BlobServiceClient(account_url=account_url)
            else:
                raise ValueError("Either connection_string or account_url must be provided")
            
            return True
        except ImportError:
            raise RuntimeError("azure-storage-blob not installed. Install with: pip install azure-storage-blob")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to Azure Blob: {str(e)}")
    
    def disconnect(self):
        """Close Azure Blob connection"""
        self.blob_service_client = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Azure Blob connection"""
        try:
            self.connect()
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=self.blob_name
            )
            
            properties = blob_client.get_blob_properties()
            return {
                'status': 'success',
                'message': 'Successfully connected to Azure Blob',
                'container': self.container_name,
                'blob': self.blob_name,
                'size_bytes': properties.size,
                'last_modified': str(properties.last_modified)
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from Azure Blob"""
        if not self.blob_service_client:
            self.connect()
        
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=self.blob_name
            )
            
            content = blob_client.download_blob().readall()
            
            # Determine file type and read accordingly
            if self.blob_name.endswith('.csv'):
                df = pd.read_csv(BytesIO(content))
            elif self.blob_name.endswith('.parquet'):
                df = pd.read_parquet(BytesIO(content))
            elif self.blob_name.endswith('.json'):
                df = pd.read_json(BytesIO(content))
            else:
                df = pd.read_csv(BytesIO(content))
            
            # Apply sample size if specified
            if self.config.sample_size and len(df) > self.config.sample_size:
                df = df.sample(n=self.config.sample_size, random_state=42)
            
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from Azure Blob: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """Get schema information"""
        df = self.preview_data(100)
        return {
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'nullable': {col: df[col].isnull().any() for col in df.columns}
        }
    
    def preview_data(self, n_rows: int = 10) -> pd.DataFrame:
        """Preview first n rows"""
        df = self.load_data()
        return df.head(n_rows)
