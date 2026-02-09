"""
Data Warehouse Connectors
Supports BigQuery, Snowflake, Redshift, Databricks, Teradata
"""
import pandas as pd
from typing import Dict, Any
from .base import DataConnector, ConnectionConfig


class BigQueryConnector(DataConnector):
    """Connector for Google BigQuery"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.client = None
        self.project_id = config.connection_params.get('project_id')
        self.credentials_path = config.connection_params.get('credentials_path')
        
    def connect(self) -> bool:
        """Establish BigQuery connection"""
        try:
            from google.cloud import bigquery
            import os
            
            if self.credentials_path:
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = self.credentials_path
            
            self.client = bigquery.Client(project=self.project_id)
            return True
        except ImportError:
            raise RuntimeError("google-cloud-bigquery not installed. Install with: pip install google-cloud-bigquery")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to BigQuery: {str(e)}")
    
    def disconnect(self):
        """Close BigQuery connection"""
        if self.client:
            self.client.close()
            self.client = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test BigQuery connection"""
        try:
            self.connect()
            # Run a simple query to test
            query = "SELECT 1 as test"
            self.client.query(query).result()
            return {
                'status': 'success',
                'message': 'Successfully connected to BigQuery',
                'project_id': self.project_id
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from BigQuery"""
        if not self.client:
            self.connect()
        
        try:
            query = self.config.query_or_path
            
            # Apply sample size if specified
            if self.config.sample_size:
                if 'LIMIT' not in query.upper():
                    query = f"{query} LIMIT {self.config.sample_size}"
            
            df = self.client.query(query).to_dataframe()
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from BigQuery: {str(e)}")
    
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
        if not self.client:
            self.connect()
        
        query = self.config.query_or_path
        if 'LIMIT' not in query.upper():
            query = f"{query} LIMIT {n_rows}"
        
        return self.client.query(query).to_dataframe()


class SnowflakeConnector(DataConnector):
    """Connector for Snowflake"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.connection = None
        self.account = config.connection_params.get('account')
        self.user = config.connection_params.get('user')
        self.password = config.connection_params.get('password')
        self.warehouse = config.connection_params.get('warehouse')
        self.database = config.connection_params.get('database')
        self.schema = config.connection_params.get('schema', 'public')
        self.role = config.connection_params.get('role')
        
    def connect(self) -> bool:
        """Establish Snowflake connection"""
        try:
            import snowflake.connector
            
            connection_params = {
                'account': self.account,
                'user': self.user,
                'password': self.password,
                'warehouse': self.warehouse,
                'database': self.database,
                'schema': self.schema
            }
            
            if self.role:
                connection_params['role'] = self.role
            
            self.connection = snowflake.connector.connect(**connection_params)
            return True
        except ImportError:
            raise RuntimeError("snowflake-connector-python not installed. Install with: pip install snowflake-connector-python")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to Snowflake: {str(e)}")
    
    def disconnect(self):
        """Close Snowflake connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Snowflake connection"""
        try:
            self.connect()
            cursor = self.connection.cursor()
            cursor.execute("SELECT CURRENT_VERSION()")
            version = cursor.fetchone()[0]
            cursor.close()
            return {
                'status': 'success',
                'message': 'Successfully connected to Snowflake',
                'account': self.account,
                'database': self.database,
                'version': version
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from Snowflake"""
        if not self.connection:
            self.connect()
        
        try:
            query = self.config.query_or_path
            
            # Apply sample size if specified
            if self.config.sample_size and 'LIMIT' not in query.upper():
                query = f"{query} LIMIT {self.config.sample_size}"
            
            df = pd.read_sql(query, self.connection)
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from Snowflake: {str(e)}")
    
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
        if not self.connection:
            self.connect()
        
        query = self.config.query_or_path
        if 'LIMIT' not in query.upper():
            query = f"{query} LIMIT {n_rows}"
        
        return pd.read_sql(query, self.connection)


class RedshiftConnector(DataConnector):
    """Connector for AWS Redshift"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.engine = None
        
    def connect(self) -> bool:
        """Establish Redshift connection"""
        try:
            from sqlalchemy import create_engine
            
            params = self.config.connection_params
            host = params.get('host')
            port = params.get('port', 5439)
            database = params.get('database')
            user = params.get('user')
            password = params.get('password')
            
            connection_string = f"redshift+psycopg2://{user}:{password}@{host}:{port}/{database}"
            self.engine = create_engine(connection_string)
            
            # Test connection
            with self.engine.connect() as conn:
                from sqlalchemy import text
                conn.execute(text("SELECT 1"))
            
            return True
        except Exception as e:
            raise RuntimeError(f"Failed to connect to Redshift: {str(e)}")
    
    def disconnect(self):
        """Close Redshift connection"""
        if self.engine:
            self.engine.dispose()
            self.engine = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Redshift connection"""
        try:
            self.connect()
            return {
                'status': 'success',
                'message': 'Successfully connected to Redshift',
                'database': self.config.connection_params.get('database')
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from Redshift"""
        if not self.engine:
            self.connect()
        
        try:
            query = self.config.query_or_path
            
            # Apply sample size if specified
            if self.config.sample_size and 'LIMIT' not in query.upper():
                query = f"{query} LIMIT {self.config.sample_size}"
            
            df = pd.read_sql(query, self.engine)
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from Redshift: {str(e)}")
    
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
        if not self.engine:
            self.connect()
        
        query = self.config.query_or_path
        if 'LIMIT' not in query.upper():
            query = f"{query} LIMIT {n_rows}"
        
        return pd.read_sql(query, self.engine)


class DatabricksConnector(DataConnector):
    """Connector for Databricks"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.connection = None
        
    def connect(self) -> bool:
        """Establish Databricks connection"""
        try:
            from databricks import sql
            
            params = self.config.connection_params
            server_hostname = params.get('server_hostname')
            http_path = params.get('http_path')
            access_token = params.get('access_token')
            
            self.connection = sql.connect(
                server_hostname=server_hostname,
                http_path=http_path,
                access_token=access_token
            )
            return True
        except ImportError:
            raise RuntimeError("databricks-sql-connector not installed. Install with: pip install databricks-sql-connector")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to Databricks: {str(e)}")
    
    def disconnect(self):
        """Close Databricks connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Databricks connection"""
        try:
            self.connect()
            cursor = self.connection.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return {
                'status': 'success',
                'message': 'Successfully connected to Databricks'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from Databricks"""
        if not self.connection:
            self.connect()
        
        try:
            query = self.config.query_or_path
            
            # Apply sample size if specified
            if self.config.sample_size and 'LIMIT' not in query.upper():
                query = f"{query} LIMIT {self.config.sample_size}"
            
            cursor = self.connection.cursor()
            cursor.execute(query)
            
            # Fetch results
            columns = [desc[0] for desc in cursor.description]
            data = cursor.fetchall()
            cursor.close()
            
            df = pd.DataFrame(data, columns=columns)
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from Databricks: {str(e)}")
    
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
        if not self.connection:
            self.connect()
        
        query = self.config.query_or_path
        if 'LIMIT' not in query.upper():
            query = f"{query} LIMIT {n_rows}"
        
        cursor = self.connection.cursor()
        cursor.execute(query)
        
        columns = [desc[0] for desc in cursor.description]
        data = cursor.fetchall()
        cursor.close()
        
        return pd.DataFrame(data, columns=columns)


class TeradataConnector(DataConnector):
    """Connector for Teradata"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.connection = None
        
    def connect(self) -> bool:
        """Establish Teradata connection"""
        try:
            import teradatasql
            
            params = self.config.connection_params
            host = params.get('host')
            user = params.get('user')
            password = params.get('password')
            database = params.get('database')
            
            self.connection = teradatasql.connect(
                host=host,
                user=user,
                password=password,
                database=database
            )
            return True
        except ImportError:
            raise RuntimeError("teradatasql not installed. Install with: pip install teradatasql")
        except Exception as e:
            raise RuntimeError(f"Failed to connect to Teradata: {str(e)}")
    
    def disconnect(self):
        """Close Teradata connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Teradata connection"""
        try:
            self.connect()
            cursor = self.connection.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            return {
                'status': 'success',
                'message': 'Successfully connected to Teradata',
                'database': self.config.connection_params.get('database')
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load data from Teradata"""
        if not self.connection:
            self.connect()
        
        try:
            query = self.config.query_or_path
            
            # Apply sample size if specified
            if self.config.sample_size and 'SAMPLE' not in query.upper():
                query = f"{query} SAMPLE {self.config.sample_size}"
            
            df = pd.read_sql(query, self.connection)
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from Teradata: {str(e)}")
    
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
        if not self.connection:
            self.connect()
        
        query = self.config.query_or_path
        if 'SAMPLE' not in query.upper():
            query = f"{query} SAMPLE {n_rows}"
        
        return pd.read_sql(query, self.connection)
