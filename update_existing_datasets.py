#!/usr/bin/env python3
"""
Script to Update Existing Datasets with Row and Column Counts
Run this after adding the new columns to your database
"""

import sqlite3
import pandas as pd
from pathlib import Path
from datetime import datetime
import os

# Configuration
DATABASE_PATH = "your_database.db"  # Update this to your actual database path
BASE_DATA_PATH = "data/01_raw"  # Update to your data directory

def get_csv_stats(file_path: str) -> tuple[int, int]:
    """
    Read CSV file and return (row_count, column_count)
    """
    try:
        # Try reading with pandas
        df = pd.read_csv(file_path)
        return len(df), len(df.columns)
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return 0, 0


def update_datasets():
    """
    Update all existing datasets with row_count and column_count
    """
    # Connect to database
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("UPDATING EXISTING DATASETS")
    print("=" * 80)
    
    # Get all datasets that need updating
    cursor.execute("""
        SELECT id, name, file_path, original_filename
        FROM datasets
        WHERE row_count = 0 OR row_count IS NULL OR column_count = 0 OR column_count IS NULL
    """)
    
    datasets = cursor.fetchall()
    total = len(datasets)
    
    if total == 0:
        print("✅ No datasets need updating. All datasets have row_count and column_count.")
        conn.close()
        return
    
    print(f"\n📊 Found {total} dataset(s) to update\n")
    
    updated = 0
    failed = 0
    
    for idx, (dataset_id, name, file_path, original_filename) in enumerate(datasets, 1):
        print(f"[{idx}/{total}] Processing: {name}")
        print(f"  ID: {dataset_id}")
        print(f"  File: {original_filename}")
        print(f"  Path: {file_path}")
        
        # Check if file exists
        if not file_path:
            print(f"  ⚠️  No file path in database")
            failed += 1
            continue
            
        if not os.path.exists(file_path):
            print(f"  ⚠️  File not found: {file_path}")
            failed += 1
            continue
        
        # Get stats
        row_count, column_count = get_csv_stats(file_path)
        
        if row_count > 0 and column_count > 0:
            # Update database
            cursor.execute("""
                UPDATE datasets
                SET row_count = ?,
                    column_count = ?,
                    updated_at = ?
                WHERE id = ?
            """, (row_count, column_count, datetime.now().isoformat(), dataset_id))
            
            print(f"  ✅ Updated: {row_count:,} rows, {column_count} columns")
            updated += 1
        else:
            print(f"  ❌ Failed to read file")
            failed += 1
        
        print()
    
    # Commit changes
    conn.commit()
    conn.close()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total datasets: {total}")
    print(f"✅ Updated: {updated}")
    print(f"❌ Failed: {failed}")
    print()
    
    if updated > 0:
        print("🎉 Successfully updated datasets!")
        print("\nNext steps:")
        print("1. Verify the updates by querying your database:")
        print("   SELECT id, name, row_count, column_count FROM datasets;")
        print("2. Restart your FastAPI backend")
        print("3. Refresh your frontend - datasets should now appear!")
    

def verify_database_schema():
    """
    Verify that the database has the required columns
    """
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("VERIFYING DATABASE SCHEMA")
    print("=" * 80)
    
    # Get table info
    cursor.execute("PRAGMA table_info(datasets)")
    columns = cursor.fetchall()
    
    required_columns = [
        'id', 'name', 'workspace_id', 'file_path', 'file_size',
        'row_count', 'column_count', 'status', 'created_at', 'updated_at'
    ]
    
    existing_columns = [col[1] for col in columns]
    
    print("\n📋 Existing columns in 'datasets' table:")
    for col in columns:
        col_id, col_name, col_type, not_null, default, pk = col
        print(f"  - {col_name} ({col_type})")
    
    missing_columns = [col for col in required_columns if col not in existing_columns]
    
    if missing_columns:
        print(f"\n⚠️  Missing columns: {', '.join(missing_columns)}")
        print("\nRun these SQL commands to add missing columns:")
        print("-" * 80)
        if 'row_count' in missing_columns:
            print("ALTER TABLE datasets ADD COLUMN row_count INTEGER DEFAULT 0;")
        if 'column_count' in missing_columns:
            print("ALTER TABLE datasets ADD COLUMN column_count INTEGER DEFAULT 0;")
        if 'status' in missing_columns:
            print("ALTER TABLE datasets ADD COLUMN status TEXT DEFAULT 'ACTIVE';")
        if 'updated_at' in missing_columns:
            print("ALTER TABLE datasets ADD COLUMN updated_at TIMESTAMP;")
        if 'description' in missing_columns:
            print("ALTER TABLE datasets ADD COLUMN description TEXT;")
        print("-" * 80)
        print("\nAfter running these commands, run this script again.")
        conn.close()
        return False
    else:
        print("\n✅ All required columns exist!")
        conn.close()
        return True


def show_current_datasets():
    """
    Display current datasets in the database
    """
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("CURRENT DATASETS")
    print("=" * 80)
    
    cursor.execute("""
        SELECT 
            id,
            name,
            COALESCE(row_count, 0) as row_count,
            COALESCE(column_count, 0) as column_count,
            COALESCE(status, 'ACTIVE') as status,
            file_size,
            created_at
        FROM datasets
        ORDER BY created_at DESC
    """)
    
    datasets = cursor.fetchall()
    
    if not datasets:
        print("\n❌ No datasets found in database")
    else:
        print(f"\n📊 Found {len(datasets)} dataset(s):\n")
        for dataset in datasets:
            dataset_id, name, row_count, column_count, status, file_size, created_at = dataset
            print(f"Name: {name}")
            print(f"  ID: {dataset_id}")
            print(f"  Rows: {row_count:,} | Columns: {column_count}")
            print(f"  Size: {file_size:,} bytes")
            print(f"  Status: {status}")
            print(f"  Created: {created_at}")
            print()
    
    conn.close()


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print(" Dataset Update Tool")
    print("=" * 80)
    
    # Check if database exists
    if not os.path.exists(DATABASE_PATH):
        print(f"\n❌ Database not found: {DATABASE_PATH}")
        print("\nPlease update DATABASE_PATH in this script to point to your database file.")
        exit(1)
    
    # Step 1: Verify schema
    print("\nStep 1: Verifying database schema...")
    if not verify_database_schema():
        print("\n⚠️  Please fix the database schema first.")
        exit(1)
    
    # Step 2: Show current datasets
    print("\nStep 2: Showing current datasets...")
    show_current_datasets()
    
    # Step 3: Confirm update
    print("\nStep 3: Ready to update datasets")
    response = input("\nProceed with updating datasets? (y/n): ")
    
    if response.lower() == 'y':
        update_datasets()
        print("\nStep 4: Showing updated datasets...")
        show_current_datasets()
    else:
        print("\n❌ Update cancelled by user")
    
    print("\n" + "=" * 80)
    print(" Done!")
    print("=" * 80 + "\n")
