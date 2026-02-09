"""
Base classes for data connectors
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import pandas as pd


@dataclass
class ConnectionConfig:
    """Configuration for data source connection"""
    source_type: str  # 'csv', 'mysql', 'bigquery', 's3', etc.
    connection_params: Dict[str, Any]
    query_or_path: str
    cache_enabled: bool = True
    sample_size: Optional[int] = None


class DataConnector(ABC):
    """
    Abstract base class for all data connectors
    All connectors must implement these methods
    """
    
    def __init__(self, config: ConnectionConfig):
        self.config = config
        self.connection = None
        
    @abstractmethod
    def connect(self) -> bool:
        """
        Establish connection to data source
        Returns True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    def disconnect(self):
        """Close connection to data source"""
        pass
    
    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        Test connection to data source
        Returns dict with status and details
        """
        pass
    
    @abstractmethod
    def load_data(self) -> pd.DataFrame:
        """
        Load data from source into pandas DataFrame
        Returns DataFrame
        """
        pass
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """
        Get schema information (columns, types, etc.)
        Returns dict with schema details
        """
        pass
    
    @abstractmethod
    def preview_data(self, n_rows: int = 10) -> pd.DataFrame:
        """
        Preview first n rows of data
        Returns DataFrame with sample data
        """
        pass
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get basic statistics about the data source
        Returns dict with statistics
        """
        try:
            data = self.preview_data(1000)
            return {
                'row_count': len(data),
                'column_count': len(data.columns),
                'columns': list(data.columns),
                'dtypes': {col: str(dtype) for col, dtype in data.dtypes.items()},
                'null_counts': data.isnull().sum().to_dict(),
                'sample_values': {col: data[col].head(5).tolist() for col in data.columns}
            }
        except Exception as e:
            return {'error': str(e)}
    
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
