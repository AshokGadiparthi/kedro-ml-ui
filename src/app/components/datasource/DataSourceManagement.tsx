import React, { useState } from 'react';
import { Plus, Database, Edit, Trash2, Eye, Table2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  DataSourceWizard,
  type DataSourceConfig,
  type TableInfo,
} from './DataSourceWizard';

// Mock data for demonstration
const mockAvailableTables: TableInfo[] = [
  {
    id: 'application',
    name: 'application',
    rowCount: 307511,
    columns: [
      { name: 'SK_ID_CURR', type: 'int', nullable: false, unique: true },
      { name: 'TARGET', type: 'int', nullable: false, unique: false },
      { name: 'NAME_CONTRACT_TYPE', type: 'varchar', nullable: false, unique: false },
      { name: 'CODE_GENDER', type: 'varchar', nullable: false, unique: false },
      { name: 'FLAG_OWN_CAR', type: 'varchar', nullable: false, unique: false },
      { name: 'FLAG_OWN_REALTY', type: 'varchar', nullable: false, unique: false },
      { name: 'CNT_CHILDREN', type: 'int', nullable: false, unique: false },
      { name: 'AMT_INCOME_TOTAL', type: 'decimal', nullable: false, unique: false },
      { name: 'AMT_CREDIT', type: 'decimal', nullable: false, unique: false },
      { name: 'AMT_ANNUITY', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_GOODS_PRICE', type: 'decimal', nullable: true, unique: false },
      { name: 'NAME_EDUCATION_TYPE', type: 'varchar', nullable: false, unique: false },
      { name: 'NAME_FAMILY_STATUS', type: 'varchar', nullable: false, unique: false },
      { name: 'DAYS_BIRTH', type: 'int', nullable: false, unique: false },
      { name: 'DAYS_EMPLOYED', type: 'int', nullable: false, unique: false },
    ],
  },
  {
    id: 'bureau',
    name: 'bureau',
    rowCount: 1716428,
    columns: [
      { name: 'SK_ID_BUREAU', type: 'int', nullable: false, unique: true },
      { name: 'SK_ID_CURR', type: 'int', nullable: false, unique: false },
      { name: 'CREDIT_ACTIVE', type: 'varchar', nullable: false, unique: false },
      { name: 'CREDIT_CURRENCY', type: 'varchar', nullable: false, unique: false },
      { name: 'DAYS_CREDIT', type: 'int', nullable: false, unique: false },
      { name: 'CREDIT_DAY_OVERDUE', type: 'int', nullable: false, unique: false },
      { name: 'DAYS_CREDIT_ENDDATE', type: 'decimal', nullable: true, unique: false },
      { name: 'DAYS_ENDDATE_FACT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_CREDIT_MAX_OVERDUE', type: 'decimal', nullable: true, unique: false },
      { name: 'CNT_CREDIT_PROLONG', type: 'int', nullable: false, unique: false },
      { name: 'AMT_CREDIT_SUM', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_CREDIT_SUM_DEBT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_CREDIT_SUM_LIMIT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_CREDIT_SUM_OVERDUE', type: 'decimal', nullable: true, unique: false },
    ],
  },
  {
    id: 'previous_application',
    name: 'previous_application',
    rowCount: 1670214,
    columns: [
      { name: 'SK_ID_PREV', type: 'int', nullable: false, unique: true },
      { name: 'SK_ID_CURR', type: 'int', nullable: false, unique: false },
      { name: 'NAME_CONTRACT_TYPE', type: 'varchar', nullable: false, unique: false },
      { name: 'AMT_ANNUITY', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_APPLICATION', type: 'decimal', nullable: false, unique: false },
      { name: 'AMT_CREDIT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_DOWN_PAYMENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_GOODS_PRICE', type: 'decimal', nullable: true, unique: false },
      { name: 'NAME_CONTRACT_STATUS', type: 'varchar', nullable: false, unique: false },
      { name: 'DAYS_DECISION', type: 'int', nullable: false, unique: false },
      { name: 'NAME_PAYMENT_TYPE', type: 'varchar', nullable: false, unique: false },
      { name: 'CODE_REJECT_REASON', type: 'varchar', nullable: false, unique: false },
    ],
  },
  {
    id: 'pos_cash_balance',
    name: 'POS_CASH_balance',
    rowCount: 10001358,
    columns: [
      { name: 'SK_ID_PREV', type: 'int', nullable: false, unique: false },
      { name: 'SK_ID_CURR', type: 'int', nullable: false, unique: false },
      { name: 'MONTHS_BALANCE', type: 'int', nullable: false, unique: false },
      { name: 'CNT_INSTALMENT', type: 'decimal', nullable: true, unique: false },
      { name: 'CNT_INSTALMENT_FUTURE', type: 'decimal', nullable: true, unique: false },
      { name: 'NAME_CONTRACT_STATUS', type: 'varchar', nullable: false, unique: false },
      { name: 'SK_DPD', type: 'int', nullable: false, unique: false },
      { name: 'SK_DPD_DEF', type: 'int', nullable: false, unique: false },
    ],
  },
  {
    id: 'credit_card_balance',
    name: 'credit_card_balance',
    rowCount: 3840312,
    columns: [
      { name: 'SK_ID_PREV', type: 'int', nullable: false, unique: false },
      { name: 'SK_ID_CURR', type: 'int', nullable: false, unique: false },
      { name: 'MONTHS_BALANCE', type: 'int', nullable: false, unique: false },
      { name: 'AMT_BALANCE', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_CREDIT_LIMIT_ACTUAL', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_DRAWINGS_ATM_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_DRAWINGS_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_DRAWINGS_OTHER_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_DRAWINGS_POS_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_INST_MIN_REGULARITY', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_PAYMENT_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_PAYMENT_TOTAL_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_RECEIVABLE_PRINCIPAL', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_RECIVABLE', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_TOTAL_RECEIVABLE', type: 'decimal', nullable: true, unique: false },
      { name: 'CNT_DRAWINGS_ATM_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'CNT_DRAWINGS_CURRENT', type: 'int', nullable: false, unique: false },
      { name: 'CNT_DRAWINGS_OTHER_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'CNT_DRAWINGS_POS_CURRENT', type: 'decimal', nullable: true, unique: false },
      { name: 'CNT_INSTALMENT_MATURE_CUM', type: 'decimal', nullable: true, unique: false },
      { name: 'NAME_CONTRACT_STATUS', type: 'varchar', nullable: false, unique: false },
      { name: 'SK_DPD', type: 'int', nullable: false, unique: false },
      { name: 'SK_DPD_DEF', type: 'int', nullable: false, unique: false },
    ],
  },
  {
    id: 'installments_payments',
    name: 'installments_payments',
    rowCount: 13605401,
    columns: [
      { name: 'SK_ID_PREV', type: 'int', nullable: false, unique: false },
      { name: 'SK_ID_CURR', type: 'int', nullable: false, unique: false },
      { name: 'NUM_INSTALMENT_VERSION', type: 'decimal', nullable: false, unique: false },
      { name: 'NUM_INSTALMENT_NUMBER', type: 'int', nullable: false, unique: false },
      { name: 'DAYS_INSTALMENT', type: 'decimal', nullable: false, unique: false },
      { name: 'DAYS_ENTRY_PAYMENT', type: 'decimal', nullable: true, unique: false },
      { name: 'AMT_INSTALMENT', type: 'decimal', nullable: false, unique: false },
      { name: 'AMT_PAYMENT', type: 'decimal', nullable: true, unique: false },
    ],
  },
];

export const DataSourceManagement: React.FC = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);

  const handleSaveDataSource = (config: DataSourceConfig) => {
    setDataSources([...dataSources, config]);
    console.log('Data source saved:', config);
    // In real app, this would call your API to save the configuration
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Source Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage multi-table data sources with joins and aggregations
          </p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Data Source
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Sources</p>
              <p className="text-2xl font-bold">{dataSources.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Table2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Tables</p>
              <p className="text-2xl font-bold">{mockAvailableTables.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold">
                {(mockAvailableTables.reduce((sum, t) => sum + t.rowCount, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Columns</p>
              <p className="text-2xl font-bold">
                {mockAvailableTables.reduce((sum, t) => sum + t.columns.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Sources List */}
      {dataSources.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Database className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Data Sources Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first data source by combining tables with joins and aggregations.
            Perfect for complex analytics and machine learning workflows.
          </p>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Data Source
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((ds, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{ds.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ds.description || 'No description'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tables</span>
                  <Badge variant="secondary">{ds.tables.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Joins</span>
                  <Badge variant="secondary">{ds.joins.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aggregations</span>
                  <Badge variant="secondary">{ds.aggregations.length}</Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Wizard */}
      <DataSourceWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSave={handleSaveDataSource}
        availableTables={mockAvailableTables}
      />
    </div>
  );
};
