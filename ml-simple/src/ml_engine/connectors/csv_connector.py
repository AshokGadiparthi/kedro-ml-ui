"""
CSV File Connector
Supports local CSV files
"""
import pandas as pd
from pathlib import Path
from typing import Dict, Any
from .base import DataConnector, ConnectionConfig


class CSVConnector(DataConnector):
    """Connector for CSV files"""
    
    def __init__(self, config: ConnectionConfig):
        super().__init__(config)
        self.file_path = config.query_or_path
        self.encoding = config.connection_params.get('encoding', 'utf-8')
        self.delimiter = config.connection_params.get('delimiter', ',')
        self.has_header = config.connection_params.get('has_header', True)
        
    def connect(self) -> bool:
        """Validate file exists"""
        path = Path(self.file_path)
        if not path.exists():
            raise FileNotFoundError(f"CSV file not found: {self.file_path}")
        if not path.is_file():
            raise ValueError(f"Path is not a file: {self.file_path}")
        return True
    
    def disconnect(self):
        """No persistent connection for CSV"""
        pass
    
    def test_connection(self) -> Dict[str, Any]:
        """Test if file is accessible and valid CSV"""
        try:
            self.connect()
            # Try to read first few rows
            df = pd.read_csv(
                self.file_path,
                encoding=self.encoding,
                delimiter=self.delimiter,
                nrows=5
            )
            return {
                'status': 'success',
                'message': f'Successfully connected to CSV file',
                'rows_sampled': len(df),
                'columns': len(df.columns)
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def load_data(self) -> pd.DataFrame:
        """Load entire CSV file"""
        try:
            header = 0 if self.has_header else None
            df = pd.read_csv(
                self.file_path,
                encoding=self.encoding,
                delimiter=self.delimiter,
                header=header
            )
            
            # Apply sample size if specified
            if self.config.sample_size and len(df) > self.config.sample_size:
                df = df.sample(n=self.config.sample_size, random_state=42)
            
            return df
        except Exception as e:
            raise RuntimeError(f"Failed to load CSV: {str(e)}")
    
    def get_schema(self) -> Dict[str, Any]:
        """Get schema information from CSV"""
        df = self.preview_data(100)
        return {
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'nullable': {col: df[col].isnull().any() for col in df.columns}
        }
    
    def preview_data(self, n_rows: int = 10) -> pd.DataFrame:
        """Preview first n rows"""
        header = 0 if self.has_header else None
        return pd.read_csv(
            self.file_path,
            encoding=self.encoding,
            delimiter=self.delimiter,
            header=header,
            nrows=n_rows
        )
