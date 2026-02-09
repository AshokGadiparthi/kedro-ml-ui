"""
FastAPI Backend Example for Dataset Management
This shows how to modify your existing FastAPI endpoints to work with the current frontend
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import sqlite3

router = APIRouter(prefix="/api/datasets", tags=["datasets"])

# ============================================================================
# RESPONSE MODELS (what frontend expects)
# ============================================================================

class DatasetResponse(BaseModel):
    """
    Single dataset response model
    Matches the frontend Dataset interface after transformation
    """
    id: str
    name: str
    description: Optional[str] = None
    
    # File information
    file_name: str  # Original filename (e.g., "sample_data.csv")
    file_path: Optional[str] = None
    file_size: int  # Size in bytes (frontend will format to "2.5 MB")
    
    # Data statistics
    row_count: int = 0
    column_count: int = 0
    
    # Quality metrics
    quality_score: Optional[float] = None  # 0-1 scale
    
    # Metadata
    status: str = "ACTIVE"  # UPLOADING, PROCESSING, ACTIVE, ERROR, DELETED
    workspace_id: Optional[str] = None
    project_id: Optional[str] = None
    created_at: str  # ISO timestamp
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# DATABASE HELPER (for your current schema)
# ============================================================================

def get_db():
    """Get database connection"""
    conn = sqlite3.connect('your_database.db')
    conn.row_factory = sqlite3.Row  # Returns rows as dicts
    return conn


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[DatasetResponse])
async def get_datasets(
    workspace_id: Optional[str] = None,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get all datasets
    
    Frontend calls: datasetService.getDatasets(currentProject.id)
    But backend filters by authenticated user's workspace automatically
    """
    
    cursor = db.cursor()
    
    # Your current database schema query
    # Adjust the WHERE clause based on how you filter by user/workspace
    if workspace_id:
        query = """
        SELECT 
            id,
            name,
            description,
            original_filename as file_name,
            file_path,
            file_size,
            row_count,
            column_count,
            status,
            workspace_id,
            created_at,
            updated_at
        FROM datasets
        WHERE workspace_id = ?
        ORDER BY created_at DESC
        """
        cursor.execute(query, (workspace_id,))
    else:
        # If filtering by authenticated user's workspaces
        query = """
        SELECT 
            id,
            name,
            description,
            original_filename as file_name,
            file_path,
            file_size,
            row_count,
            column_count,
            status,
            workspace_id,
            created_at,
            updated_at
        FROM datasets
        ORDER BY created_at DESC
        """
        cursor.execute(query)
    
    rows = cursor.fetchall()
    
    # Transform database rows to response format
    datasets = []
    for row in rows:
        dataset = {
            "id": row["id"],
            "name": row["name"],
            "description": row.get("description"),
            "file_name": row["file_name"],
            "file_path": row.get("file_path"),
            "file_size": row.get("file_size", 0),  # In bytes
            "row_count": row.get("row_count", 0),
            "column_count": row.get("column_count", 0),
            "quality_score": None,  # Calculate if you have quality metrics
            "status": row.get("status", "ACTIVE"),
            "workspace_id": row.get("workspace_id"),
            "project_id": row.get("workspace_id"),  # Same as workspace_id
            "created_at": row["created_at"],
            "updated_at": row.get("updated_at"),
        }
        datasets.append(dataset)
    
    db.close()
    return datasets


@router.get("/{dataset_id}/details", response_model=DatasetResponse)
async def get_dataset_details(
    dataset_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get detailed information about a specific dataset
    
    Frontend calls: datasetService.getDatasetById(id)
    """
    
    cursor = db.cursor()
    query = """
    SELECT 
        id,
        name,
        description,
        original_filename as file_name,
        file_path,
        file_size,
        row_count,
        column_count,
        status,
        workspace_id,
        created_at,
        updated_at
    FROM datasets
    WHERE id = ?
    """
    cursor.execute(query, (dataset_id,))
    row = cursor.fetchone()
    
    if not row:
        db.close()
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    dataset = {
        "id": row["id"],
        "name": row["name"],
        "description": row.get("description"),
        "file_name": row["file_name"],
        "file_path": row.get("file_path"),
        "file_size": row.get("file_size", 0),
        "row_count": row.get("row_count", 0),
        "column_count": row.get("column_count", 0),
        "quality_score": None,
        "status": row.get("status", "ACTIVE"),
        "workspace_id": row.get("workspace_id"),
        "project_id": row.get("workspace_id"),
        "created_at": row["created_at"],
        "updated_at": row.get("updated_at"),
    }
    
    db.close()
    return dataset


@router.get("/{dataset_id}/preview")
async def get_dataset_preview(
    dataset_id: str,
    rows: int = 100,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get preview of dataset (first N rows)
    
    Frontend calls: datasetService.getDatasetPreview(id, rows)
    
    Returns:
        {
            "columns": ["col1", "col2", "col3"],
            "data": [
                {"col1": "val1", "col2": "val2", "col3": "val3"},
                {"col1": "val4", "col2": "val5", "col3": "val6"}
            ],
            "total_rows": 1000
        }
    
    OR you can return array of objects directly (frontend will transform):
        [
            {"col1": "val1", "col2": "val2"},
            {"col1": "val4", "col2": "val5"}
        ]
    """
    
    cursor = db.cursor()
    
    # Get dataset file path
    query = "SELECT file_path, row_count FROM datasets WHERE id = ?"
    cursor.execute(query, (dataset_id,))
    dataset = cursor.fetchone()
    
    if not dataset:
        db.close()
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    file_path = dataset["file_path"]
    total_rows = dataset.get("row_count", 0)
    
    # Read CSV file and return preview
    # You would implement CSV reading here
    import pandas as pd
    
    try:
        # Read first N rows of CSV
        df = pd.read_csv(file_path, nrows=rows)
        
        # Convert to list of dicts (frontend transformer handles this)
        data = df.to_dict(orient='records')
        columns = df.columns.tolist()
        
        db.close()
        return {
            "columns": columns,
            "data": data,
            "total_rows": total_rows
        }
        
        # OR just return the array of objects directly:
        # return data
        
    except Exception as e:
        db.close()
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")


@router.get("/{dataset_id}/quality")
async def get_dataset_quality(
    dataset_id: str,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Get data quality report for dataset
    
    Frontend calls: datasetService.getDatasetQuality(id)
    """
    
    cursor = db.cursor()
    
    # Get dataset
    query = "SELECT * FROM datasets WHERE id = ?"
    cursor.execute(query, (dataset_id,))
    dataset = cursor.fetchone()
    
    if not dataset:
        db.close()
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Calculate or retrieve quality metrics
    # This is a simplified example - you would calculate these from the actual data
    file_path = dataset["file_path"]
    
    import pandas as pd
    
    try:
        df = pd.read_csv(file_path)
        
        # Calculate quality metrics
        total_rows = len(df)
        total_cols = len(df.columns)
        missing_cells = df.isnull().sum().sum()
        total_cells = total_rows * total_cols
        missing_pct = (missing_cells / total_cells) * 100 if total_cells > 0 else 0
        
        # Duplicate rows
        duplicate_rows = df.duplicated().sum()
        duplicate_pct = (duplicate_rows / total_rows) * 100 if total_rows > 0 else 0
        
        # Overall quality score (simple calculation)
        quality_score = max(0, 1 - (missing_pct / 100) - (duplicate_pct / 200))
        
        # Column-level quality
        schema = []
        for col in df.columns:
            col_missing = df[col].isnull().sum()
            col_missing_pct = (col_missing / total_rows) * 100 if total_rows > 0 else 0
            
            schema.append({
                "name": col,
                "type": str(df[col].dtype),
                "unique_values": df[col].nunique(),
                "missing_pct": col_missing_pct,
                "nullable": col_missing > 0,
                "has_outliers": False,  # Would need statistical calculation
                "quality_issue": None
            })
        
        db.close()
        return {
            "id": dataset_id,
            "name": dataset["name"],
            "file_name": dataset.get("original_filename", ""),
            "file_size": dataset.get("file_size", 0),
            "row_count": total_rows,
            "column_count": total_cols,
            "quality_score": quality_score,
            "overall_score": quality_score,
            "completeness_score": 1 - (missing_pct / 100),
            "uniqueness_score": 1 - (duplicate_pct / 100),
            "consistency_score": quality_score,
            "missing_pct": missing_pct,
            "duplicate_rows_pct": duplicate_pct,
            "schema": schema,
            "status": dataset.get("status", "ACTIVE"),
            "updated_at": dataset.get("updated_at")
        }
        
    except Exception as e:
        db.close()
        raise HTTPException(status_code=500, detail=f"Error analyzing dataset: {str(e)}")


# ============================================================================
# EXAMPLE DATABASE QUERIES FOR YOUR CURRENT SCHEMA
# ============================================================================

"""
# Your current database structure:
CREATE TABLE datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    workspace_id TEXT NOT NULL,
    parent_id TEXT,  -- NULL for now
    original_filename TEXT,
    file_size INTEGER,
    file_path TEXT,
    created_at TIMESTAMP
);

# To make this work better, you should ADD these columns:
ALTER TABLE datasets ADD COLUMN description TEXT;
ALTER TABLE datasets ADD COLUMN row_count INTEGER DEFAULT 0;
ALTER TABLE datasets ADD COLUMN column_count INTEGER DEFAULT 0;
ALTER TABLE datasets ADD COLUMN status TEXT DEFAULT 'ACTIVE';
ALTER TABLE datasets ADD COLUMN updated_at TIMESTAMP;

# Then when you upload a dataset, calculate row_count and column_count:
import pandas as pd

df = pd.read_csv(file_path)
row_count = len(df)
column_count = len(df.columns)

# Update the database:
UPDATE datasets 
SET row_count = ?, column_count = ?, updated_at = ?
WHERE id = ?
"""


# ============================================================================
# EXAMPLE API RESPONSE (what frontend receives after calling GET /api/datasets/)
# ============================================================================

"""
[
  {
    "id": "2d5e78bd-e54d-487d-a99b-ea78e89ee2c8",
    "name": "loan_ds",
    "description": null,
    "file_name": "sample_data.csv",
    "file_path": "data/01_raw/400e5a41-e8cc-44d2-89c1-8fed044d6a20/sample_data.csv",
    "file_size": 35687,
    "row_count": 1000,
    "column_count": 15,
    "quality_score": null,
    "status": "ACTIVE",
    "workspace_id": "400e5a41-e8cc-44d2-89c1-8fed044d6a20",
    "project_id": "400e5a41-e8cc-44d2-89c1-8fed044d6a20",
    "created_at": "2026-02-07T01:36:10.161272Z",
    "updated_at": null
  },
  {
    "id": "83dd609b-eb31-4c98-8fd0-4de55c01cf36",
    "name": "orders",
    "description": null,
    "file_name": "ecommerce_orders_dataset.csv",
    "file_path": "data/01_raw/400e5a41-e8cc-44d2-89c1-8fed044d6a20/ecommerce_orders_dataset.csv",
    "file_size": 195673,
    "row_count": 5000,
    "column_count": 12,
    "quality_score": null,
    "status": "ACTIVE",
    "workspace_id": "400e5a41-e8cc-44d2-89c1-8fed044d6a20",
    "project_id": "400e5a41-e8cc-44d2-89c1-8fed044d6a20",
    "created_at": "2026-02-08T04:08:51.568852Z",
    "updated_at": null
  }
]
"""
