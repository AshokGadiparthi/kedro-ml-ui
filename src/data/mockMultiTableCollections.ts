/**
 * Mock Multi-Table Dataset Collections
 * Example data for demonstration
 */

import type { DatasetCollection } from '../types/datasetCollection';

export const MOCK_MULTI_TABLE_COLLECTIONS: DatasetCollection[] = [
  {
    id: 'coll-1',
    name: 'Home Credit Default Risk',
    description: 'Comprehensive dataset for predicting loan default risk with multiple related tables including application history, credit bureau data, and previous loan performance.',
    projectId: 'proj-1',
    primaryTable: 'application_train',
    targetColumn: 'TARGET',
    status: 'ready',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tables: [
      {
        id: 'table-1',
        name: 'application_train',
        filename: 'application_train.csv',
        isPrimary: true,
        rowCount: 307511,
        fileSize: 45678912,
        columns: [
          { name: 'SK_ID_CURR', type: 'INTEGER', isPrimaryKey: true },
          { name: 'TARGET', type: 'INTEGER', isPrimaryKey: false },
          { name: 'NAME_CONTRACT_TYPE', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'CODE_GENDER', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'FLAG_OWN_CAR', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'FLAG_OWN_REALTY', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'CNT_CHILDREN', type: 'INTEGER', isPrimaryKey: false },
          { name: 'AMT_INCOME_TOTAL', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_CREDIT', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_ANNUITY', type: 'FLOAT', isPrimaryKey: false },
        ],
      },
      {
        id: 'table-2',
        name: 'bureau',
        filename: 'bureau.csv',
        isPrimary: false,
        rowCount: 1716428,
        fileSize: 189234567,
        columns: [
          { name: 'SK_ID_BUREAU', type: 'INTEGER', isPrimaryKey: true },
          { name: 'SK_ID_CURR', type: 'INTEGER', isPrimaryKey: false },
          { name: 'CREDIT_ACTIVE', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'CREDIT_CURRENCY', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'DAYS_CREDIT', type: 'INTEGER', isPrimaryKey: false },
          { name: 'CREDIT_DAY_OVERDUE', type: 'INTEGER', isPrimaryKey: false },
          { name: 'DAYS_CREDIT_ENDDATE', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_CREDIT_SUM', type: 'FLOAT', isPrimaryKey: false },
        ],
      },
      {
        id: 'table-3',
        name: 'bureau_balance',
        filename: 'bureau_balance.csv',
        isPrimary: false,
        rowCount: 27299925,
        fileSize: 312456789,
        columns: [
          { name: 'SK_ID_BUREAU', type: 'INTEGER', isPrimaryKey: false },
          { name: 'MONTHS_BALANCE', type: 'INTEGER', isPrimaryKey: false },
          { name: 'STATUS', type: 'VARCHAR', isPrimaryKey: false },
        ],
      },
      {
        id: 'table-4',
        name: 'previous_application',
        filename: 'previous_application.csv',
        isPrimary: false,
        rowCount: 1670214,
        fileSize: 156789012,
        columns: [
          { name: 'SK_ID_PREV', type: 'INTEGER', isPrimaryKey: true },
          { name: 'SK_ID_CURR', type: 'INTEGER', isPrimaryKey: false },
          { name: 'NAME_CONTRACT_TYPE', type: 'VARCHAR', isPrimaryKey: false },
          { name: 'AMT_ANNUITY', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_APPLICATION', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_CREDIT', type: 'FLOAT', isPrimaryKey: false },
          { name: 'NAME_CONTRACT_STATUS', type: 'VARCHAR', isPrimaryKey: false },
        ],
      },
      {
        id: 'table-5',
        name: 'installments_payments',
        filename: 'installments_payments.csv',
        isPrimary: false,
        rowCount: 13605401,
        fileSize: 278901234,
        columns: [
          { name: 'SK_ID_PREV', type: 'INTEGER', isPrimaryKey: false },
          { name: 'SK_ID_CURR', type: 'INTEGER', isPrimaryKey: false },
          { name: 'NUM_INSTALMENT_VERSION', type: 'FLOAT', isPrimaryKey: false },
          { name: 'NUM_INSTALMENT_NUMBER', type: 'INTEGER', isPrimaryKey: false },
          { name: 'DAYS_INSTALMENT', type: 'FLOAT', isPrimaryKey: false },
          { name: 'DAYS_ENTRY_PAYMENT', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_INSTALMENT', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_PAYMENT', type: 'FLOAT', isPrimaryKey: false },
        ],
      },
      {
        id: 'table-6',
        name: 'credit_card_balance',
        filename: 'credit_card_balance.csv',
        isPrimary: false,
        rowCount: 3840312,
        fileSize: 98765432,
        columns: [
          { name: 'SK_ID_PREV', type: 'INTEGER', isPrimaryKey: false },
          { name: 'SK_ID_CURR', type: 'INTEGER', isPrimaryKey: false },
          { name: 'MONTHS_BALANCE', type: 'INTEGER', isPrimaryKey: false },
          { name: 'AMT_BALANCE', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_CREDIT_LIMIT_ACTUAL', type: 'INTEGER', isPrimaryKey: false },
          { name: 'AMT_DRAWINGS_CURRENT', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_INST_MIN_REGULARITY', type: 'FLOAT', isPrimaryKey: false },
          { name: 'AMT_PAYMENT_CURRENT', type: 'FLOAT', isPrimaryKey: false },
        ],
      },
    ],
    relationships: [
      {
        id: 'rel-1',
        leftTable: 'application_train',
        rightTable: 'bureau',
        leftKey: 'SK_ID_CURR',
        rightKey: 'SK_ID_CURR',
        joinType: 'left',
      },
      {
        id: 'rel-2',
        leftTable: 'bureau',
        rightTable: 'bureau_balance',
        leftKey: 'SK_ID_BUREAU',
        rightKey: 'SK_ID_BUREAU',
        joinType: 'left',
      },
      {
        id: 'rel-3',
        leftTable: 'application_train',
        rightTable: 'previous_application',
        leftKey: 'SK_ID_CURR',
        rightKey: 'SK_ID_CURR',
        joinType: 'left',
      },
      {
        id: 'rel-4',
        leftTable: 'previous_application',
        rightTable: 'installments_payments',
        leftKey: 'SK_ID_PREV',
        rightKey: 'SK_ID_PREV',
        joinType: 'left',
      },
      {
        id: 'rel-5',
        leftTable: 'previous_application',
        rightTable: 'credit_card_balance',
        leftKey: 'SK_ID_PREV',
        rightKey: 'SK_ID_PREV',
        joinType: 'left',
      },
    ],
    aggregations: [
      {
        id: 'agg-1',
        tableName: 'bureau',
        groupByColumn: 'SK_ID_CURR',
        prefix: 'BUREAU',
        features: [
          {
            column: 'AMT_CREDIT_SUM',
            functions: ['sum', 'mean', 'max', 'min'],
          },
          {
            column: 'CREDIT_DAY_OVERDUE',
            functions: ['sum', 'mean', 'max'],
          },
          {
            column: 'SK_ID_BUREAU',
            functions: ['count'],
          },
        ],
      },
      {
        id: 'agg-2',
        tableName: 'previous_application',
        groupByColumn: 'SK_ID_CURR',
        prefix: 'PREV',
        features: [
          {
            column: 'AMT_CREDIT',
            functions: ['sum', 'mean', 'max'],
          },
          {
            column: 'AMT_ANNUITY',
            functions: ['sum', 'mean'],
          },
          {
            column: 'SK_ID_PREV',
            functions: ['count'],
          },
        ],
      },
      {
        id: 'agg-3',
        tableName: 'installments_payments',
        groupByColumn: 'SK_ID_CURR',
        prefix: 'INSTAL',
        features: [
          {
            column: 'AMT_PAYMENT',
            functions: ['sum', 'mean', 'max'],
          },
          {
            column: 'DAYS_ENTRY_PAYMENT',
            functions: ['mean', 'max', 'min'],
          },
        ],
      },
    ],
    mergedDataset: {
      id: 'merged-1',
      name: 'home_credit_merged',
      rowCount: 307511,
      columnCount: 245,
      fileSize: 523456789,
    },
  },
];
