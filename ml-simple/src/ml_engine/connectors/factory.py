"""
Data Connector Factory
Creates appropriate connector based on source type
"""
from typing import Dict, Any
from .base import DataConnector, ConnectionConfig
from .csv_connector import CSVConnector
from .database_connector import (
    MySQLConnector, PostgreSQLConnector, SQLServerConnector,
    OracleConnector, DB2Connector
)
from .cloud_storage_connector import S3Connector, GCSConnector, AzureBlobConnector
from .warehouse_connector import (
    BigQueryConnector, SnowflakeConnector, RedshiftConnector,
    DatabricksConnector, TeradataConnector
)


class DataConnectorFactory:
    """
    Factory class to create appropriate data connector based on source type
    """
    
    # Registry of available connectors
    CONNECTORS = {
        # Files
        'csv': CSVConnector,
        'local_file': CSVConnector,
        
        # Databases
        'mysql': MySQLConnector,
        'postgresql': PostgreSQLConnector,
        'postgres': PostgreSQLConnector,
        'mssql': SQLServerConnector,
        'sqlserver': SQLServerConnector,
        'oracle': OracleConnector,
        'db2': DB2Connector,
        
        # Cloud Storage
        's3': S3Connector,
        'aws_s3': S3Connector,
        'gcs': GCSConnector,
        'google_cloud_storage': GCSConnector,
        'azure_blob': AzureBlobConnector,
        'azure': AzureBlobConnector,
        
        # Data Warehouses
        'bigquery': BigQueryConnector,
        'snowflake': SnowflakeConnector,
        'redshift': RedshiftConnector,
        'aws_redshift': RedshiftConnector,
        'databricks': DatabricksConnector,
        'teradata': TeradataConnector,
    }
    
    @classmethod
    def create_connector(cls, config: ConnectionConfig) -> DataConnector:
        """
        Create and return appropriate connector based on source type
        
        Args:
            config: ConnectionConfig with source_type and connection_params
            
        Returns:
            DataConnector instance
            
        Raises:
            ValueError: If source_type is not supported
        """
        source_type = config.source_type.lower()
        
        if source_type not in cls.CONNECTORS:
            raise ValueError(
                f"Unsupported data source type: {source_type}. "
                f"Supported types: {', '.join(cls.CONNECTORS.keys())}"
            )
        
        connector_class = cls.CONNECTORS[source_type]
        return connector_class(config)
    
    @classmethod
    def get_supported_sources(cls) -> Dict[str, list]:
        """
        Get list of all supported data sources grouped by category
        
        Returns:
            Dict with categories and their supported sources
        """
        return {
            'files': [
                {'id': 'csv', 'name': 'CSV File', 'description': 'Local CSV file'},
                {'id': 'local_file', 'name': 'Local File', 'description': 'Local data file (CSV, Parquet, JSON)'},
            ],
            'databases': [
                {'id': 'mysql', 'name': 'MySQL', 'description': 'MySQL database'},
                {'id': 'postgresql', 'name': 'PostgreSQL', 'description': 'PostgreSQL database'},
                {'id': 'mssql', 'name': 'SQL Server', 'description': 'Microsoft SQL Server'},
                {'id': 'oracle', 'name': 'Oracle', 'description': 'Oracle database'},
                {'id': 'db2', 'name': 'IBM DB2', 'description': 'IBM DB2 database'},
            ],
            'cloud_storage': [
                {'id': 's3', 'name': 'AWS S3', 'description': 'Amazon S3 bucket'},
                {'id': 'gcs', 'name': 'Google Cloud Storage', 'description': 'Google Cloud Storage bucket'},
                {'id': 'azure_blob', 'name': 'Azure Blob Storage', 'description': 'Azure Blob Storage container'},
            ],
            'data_warehouses': [
                {'id': 'bigquery', 'name': 'BigQuery', 'description': 'Google BigQuery'},
                {'id': 'snowflake', 'name': 'Snowflake', 'description': 'Snowflake Data Warehouse'},
                {'id': 'redshift', 'name': 'AWS Redshift', 'description': 'Amazon Redshift'},
                {'id': 'databricks', 'name': 'Databricks', 'description': 'Databricks SQL'},
                {'id': 'teradata', 'name': 'Teradata', 'description': 'Teradata Database'},
            ],
        }
    
    @classmethod
    def get_connection_params_schema(cls, source_type: str) -> Dict[str, Any]:
        """
        Get required connection parameters schema for a specific source type
        
        Args:
            source_type: Type of data source
            
        Returns:
            Dict describing required and optional parameters
        """
        schemas = {
            'csv': {
                'required': ['file_path'],
                'optional': {
                    'encoding': 'utf-8',
                    'delimiter': ',',
                    'has_header': True
                }
            },
            'mysql': {
                'required': ['host', 'database', 'username', 'password'],
                'optional': {
                    'port': 3306,
                    'driver': 'pymysql'
                }
            },
            'postgresql': {
                'required': ['host', 'database', 'username', 'password'],
                'optional': {
                    'port': 5432,
                    'driver': 'psycopg2'
                }
            },
            'mssql': {
                'required': ['host', 'database', 'username', 'password'],
                'optional': {
                    'port': 1433,
                    'driver': 'pyodbc',
                    'odbc_driver': 'ODBC Driver 17 for SQL Server'
                }
            },
            'oracle': {
                'required': ['host', 'service_name', 'username', 'password'],
                'optional': {
                    'port': 1521
                }
            },
            'db2': {
                'required': ['host', 'database', 'username', 'password'],
                'optional': {
                    'port': 50000
                }
            },
            's3': {
                'required': ['bucket', 'key'],
                'optional': {
                    'aws_access_key_id': None,
                    'aws_secret_access_key': None,
                    'region': 'us-east-1'
                }
            },
            'gcs': {
                'required': ['bucket', 'blob_name'],
                'optional': {
                    'project_id': None,
                    'credentials_path': None
                }
            },
            'azure_blob': {
                'required': ['container', 'blob_name'],
                'optional': {
                    'connection_string': None,
                    'account_url': None
                }
            },
            'bigquery': {
                'required': ['project_id'],
                'optional': {
                    'credentials_path': None
                }
            },
            'snowflake': {
                'required': ['account', 'user', 'password', 'warehouse', 'database'],
                'optional': {
                    'schema': 'public',
                    'role': None
                }
            },
            'redshift': {
                'required': ['host', 'database', 'user', 'password'],
                'optional': {
                    'port': 5439
                }
            },
            'databricks': {
                'required': ['server_hostname', 'http_path', 'access_token'],
                'optional': {}
            },
            'teradata': {
                'required': ['host', 'user', 'password'],
                'optional': {
                    'database': None
                }
            },
        }
        
        source_type = source_type.lower()
        if source_type in schemas:
            return schemas[source_type]
        else:
            return {'required': [], 'optional': {}}
    
    @classmethod
    def validate_config(cls, config: ConnectionConfig) -> Dict[str, Any]:
        """
        Validate connection configuration
        
        Args:
            config: ConnectionConfig to validate
            
        Returns:
            Dict with validation results
        """
        errors = []
        warnings = []
        
        # Check if source type is supported
        if config.source_type.lower() not in cls.CONNECTORS:
            errors.append(f"Unsupported source type: {config.source_type}")
            return {'valid': False, 'errors': errors, 'warnings': warnings}
        
        # Get schema for this source type
        schema = cls.get_connection_params_schema(config.source_type)
        
        # Check required parameters
        for param in schema.get('required', []):
            if param not in config.connection_params:
                errors.append(f"Missing required parameter: {param}")
        
        # Check for query/path
        if not config.query_or_path:
            errors.append("query_or_path is required")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings
        }
