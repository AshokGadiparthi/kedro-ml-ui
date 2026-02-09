-- ============================================================================
-- SQL MIGRATION: Add Missing Columns to Existing datasets Table
-- ============================================================================

-- Step 1: Add missing columns to your current datasets table
ALTER TABLE datasets ADD COLUMN description TEXT;
ALTER TABLE datasets ADD COLUMN row_count INTEGER DEFAULT 0;
ALTER TABLE datasets ADD COLUMN column_count INTEGER DEFAULT 0;
ALTER TABLE datasets ADD COLUMN status TEXT DEFAULT 'ACTIVE';
ALTER TABLE datasets ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Rename original_filename column if it doesn't exist
-- (If your column is named differently, adjust accordingly)
-- This ensures consistency with the API response
-- ALTER TABLE datasets RENAME COLUMN file_name TO original_filename; -- Only if needed

-- Step 3: Update existing records with calculated row_count and column_count
-- You'll need to do this in Python/FastAPI code by reading each CSV:

/*
Example Python code to update existing datasets:

import pandas as pd
import sqlite3

conn = sqlite3.connect('your_database.db')
cursor = conn.cursor()

# Get all datasets
cursor.execute("SELECT id, file_path FROM datasets WHERE row_count = 0 OR row_count IS NULL")
datasets = cursor.fetchall()

for dataset_id, file_path in datasets:
    try:
        # Read CSV to get row and column counts
        df = pd.read_csv(file_path)
        row_count = len(df)
        column_count = len(df.columns)
        
        # Update database
        cursor.execute(
            "UPDATE datasets SET row_count = ?, column_count = ?, updated_at = ? WHERE id = ?",
            (row_count, column_count, datetime.now().isoformat(), dataset_id)
        )
        print(f"Updated {dataset_id}: {row_count} rows, {column_count} columns")
    except Exception as e:
        print(f"Error processing {dataset_id}: {e}")

conn.commit()
conn.close()
*/

-- ============================================================================
-- OPTIONAL: Future-proof schema for multi-table support
-- ============================================================================

-- If you want to support multi-table datasets in the future, create these tables:

-- Main datasets table (keep your existing one, just add type column)
ALTER TABLE datasets ADD COLUMN type TEXT DEFAULT 'single' CHECK (type IN ('single', 'multi-table'));
ALTER TABLE datasets ADD COLUMN primary_table_id TEXT;
ALTER TABLE datasets ADD COLUMN target_column TEXT;

CREATE INDEX IF NOT EXISTS idx_datasets_workspace ON datasets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(type);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);

-- Individual files (for multi-table collections)
CREATE TABLE IF NOT EXISTS dataset_files (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    name TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dataset_files_dataset ON dataset_files(dataset_id);

-- Table relationships (for multi-table collections)
CREATE TABLE IF NOT EXISTS dataset_relationships (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    source_file_id TEXT NOT NULL,
    target_file_id TEXT NOT NULL,
    source_column TEXT NOT NULL,
    target_column TEXT NOT NULL,
    join_type TEXT NOT NULL CHECK (join_type IN ('left', 'right', 'inner', 'outer')),
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    FOREIGN KEY (source_file_id) REFERENCES dataset_files(id) ON DELETE CASCADE,
    FOREIGN KEY (target_file_id) REFERENCES dataset_files(id) ON DELETE CASCADE
);

-- Aggregation configurations
CREATE TABLE IF NOT EXISTS dataset_aggregations (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    table_file_id TEXT NOT NULL,
    group_by_column TEXT NOT NULL,
    prefix TEXT,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE,
    FOREIGN KEY (table_file_id) REFERENCES dataset_files(id) ON DELETE CASCADE
);

-- Aggregation features
CREATE TABLE IF NOT EXISTS aggregation_features (
    id TEXT PRIMARY KEY,
    aggregation_id TEXT NOT NULL,
    column_name TEXT NOT NULL,
    functions TEXT NOT NULL,  -- JSON array: ["mean", "sum", "max"]
    FOREIGN KEY (aggregation_id) REFERENCES dataset_aggregations(id) ON DELETE CASCADE
);

-- Column metadata (schema information)
CREATE TABLE IF NOT EXISTS dataset_columns (
    id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_nullable BOOLEAN DEFAULT TRUE,
    unique_values INTEGER,
    missing_pct REAL,
    FOREIGN KEY (file_id) REFERENCES dataset_files(id) ON DELETE CASCADE
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check current datasets table structure
PRAGMA table_info(datasets);

-- View all datasets with new columns
SELECT 
    id,
    name,
    type,
    status,
    row_count,
    column_count,
    file_size,
    created_at
FROM datasets
ORDER BY created_at DESC;

-- Count datasets by type
SELECT 
    type,
    COUNT(*) as count
FROM datasets
GROUP BY type;

-- Count datasets by status
SELECT 
    status,
    COUNT(*) as count
FROM datasets
GROUP BY status;
