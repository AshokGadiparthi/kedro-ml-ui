"""
Database Connectors
Supports MySQL, PostgreSQL, SQL Server, Oracle, DB2, etc.
"""
import pandas as pd
from typing import Dict, Any
from sqlalchemy import create_engine, text
from .base import DataConnector, ConnectionConfig


class DatabaseConnector(DataConnector):
    """Base connector for SQL databases using SQLAlchemy"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.engine = None
        self.connection_string = self._build_connection_string()
        
    def _build_connection_string(self) -> str:
        """Build SQLAlchemy connection string from config"""
        params = self.config.connection_params
        
        db_type = params.get('db_type', 'mysql')
        host = params.get('host', 'localhost')
        port = params.get('port')
        database = params.get('database')
        username = params.get('username')
        password = params.get('password')
        
        # Build connection string based on database type
        if db_type == 'mysql':
            port = port or 3306
            driver = params.get('driver', 'pymysql')
            return f"mysql+{driver}://{username}:{password}@{host}:{port}/{database}"
        
        elif db_type == 'postgresql':
            port = port or 5432
            driver = params.get('driver', 'psycopg2')
            return f"postgresql+{driver}://{username}:{password}@{host}:{port}/{database}"
        
        elif db_type == 'mssql':
            port = port or 1433
            driver = params.get('driver', 'pyodbc')
            odbc_driver = params.get('odbc_driver', 'ODBC Driver 17 for SQL Server')
            return f"mssql+{driver}://{username}:{password}@{host}:{port}/{database}?driver={odbc_driver}"
        
        elif db_type == 'oracle':
            port = port or 1521
            service_name = params.get('service_name', database)
            return f"oracle+cx_oracle://{username}:{password}@{host}:{port}/?service_name={service_name}"
        
        elif db_type == 'db2':
            port = port or 50000
            return f"db2+ibm_db://{username}:{password}@{host}:{port}/{database}"
        
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    def connect(self) -> bool:
        """Establish database connection"""
        try:
            self.engine = create_engine(self.connection_string)
            # Test connection
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            raise RuntimeError(f"Failed to connect to database: {str(e)}")
    
    def disconnect(self):
        """Close database connection"""
        if self.engine:
            self.engine.dispose()
            self.engine = None
    
    def test_connection(self) -> Dict[str, Any]:
        """Test database connection"""
        try:
            self.connect()
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            return {
                'status': 'success',
                'message': 'Successfully connected to database',
                'db_type': self.config.connection_params.get('db_type'),
                'database': self.config.connection_params.get('database')
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
        finally:
            self.disconnect()
    
    def load_data(self) -> pd.DataFrame:
        """Load data from database using SQL query"""
        if not self.engine:
            self.connect()
        
        try:
            query = self.config.query_or_path
            df = pd.read_sql(query, self.engine)
            
            # Apply sample size if specified
            if self.config.sample_size and len(df) > self.config.sample_size:
                df = df.sample(n=self.config.sample_size, random_state=42)
            
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load data from database: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """Get schema information from query result"""
        df = self.preview_data(100)
        return {
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'nullable': {col: df[col].isnull().any() for col in df.columns}
        }
    
    def preview_data(self, n_rows: int = 10) -> pd.DataFrame:
        """Preview first n rows from query"""
        if not self.engine:
            self.connect()
        
        query = self.config.query_or_path
        # Add LIMIT clause if not present
        if 'LIMIT' not in query.upper() and 'TOP' not in query.upper():
            query = f"{query} LIMIT {n_rows}"
        
        return pd.read_sql(query, self.engine)


class MySQLConnector(DatabaseConnector):
    """Connector for MySQL databases"""
    
    def __init__(self, config: ConnectionConfig):
        config.connection_params['db_type'] = 'mysql'
        super().__init__(config)


class PostgreSQLConnector(DatabaseConnector):
    """Connector for PostgreSQL databases"""
    
    def __init__(self, config: ConnectionConfig):
        config.connection_params['db_type'] = 'postgresql'
        super().__init__(config)


class SQLServerConnector(DatabaseConnector):
    """Connector for Microsoft SQL Server"""
    
    def __init__(self, config: ConnectionConfig):
        config.connection_params['db_type'] = 'mssql'
        super().__init__(config)


class OracleConnector(DatabaseConnector):
    """Connector for Oracle databases"""
    
    def __init__(self, config: ConnectionConfig):
        config.connection_params['db_type'] = 'oracle'
        super().__init__(config)


class DB2Connector(DatabaseConnector):
    """Connector for IBM DB2"""
    
    def __init__(self, config: ConnectionConfig):
        config.connection_params['db_type'] = 'db2'
        super().__init__(config)
