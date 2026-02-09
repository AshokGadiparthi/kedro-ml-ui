/**
 * Project Creation Wizard
 * Multi-step wizard for creating ML projects with data source configuration
 */
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Card } from './ui/card';
import { mlApiService, DataSourceConfig } from '../../services/mlApiService';
import { toast } from 'sonner';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Rocket,
  Database,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: 'Project Details',
    description: 'Create a new ML project',
    icon: Rocket,
  },
  {
    id: 2,
    title: 'Data Source',
    description: 'Select your data source',
    icon: Database,
  },
  {
    id: 3,
    title: 'Configuration',
    description: 'Configure connection',
    icon: Settings,
  },
  {
    id: 4,
    title: 'Review',
    description: 'Preview and confirm',
    icon: FileText,
  },
];

interface ProjectWizardProps {
  onComplete: (projectId: string) => void;
  onCancel: () => void;
}

export function ProjectWizard({ onComplete, onCancel }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [dataSourceType, setDataSourceType] = useState<string>('');
  const [connectionParams, setConnectionParams] = useState<Record<string, any>>({});
  const [queryOrPath, setQueryOrPath] = useState('');

  const dataSourceOptions = [
    { value: 'csv', label: 'CSV File', category: 'Files' },
    { value: 'mysql', label: 'MySQL', category: 'Databases' },
    { value: 'postgresql', label: 'PostgreSQL', category: 'Databases' },
    { value: 'mssql', label: 'SQL Server', category: 'Databases' },
    { value: 'oracle', label: 'Oracle', category: 'Databases' },
    { value: 's3', label: 'AWS S3', category: 'Cloud Storage' },
    { value: 'gcs', label: 'Google Cloud Storage', category: 'Cloud Storage' },
    { value: 'azure_blob', label: 'Azure Blob', category: 'Cloud Storage' },
    { value: 'bigquery', label: 'BigQuery', category: 'Data Warehouses' },
    { value: 'snowflake', label: 'Snowflake', category: 'Data Warehouses' },
    { value: 'redshift', label: 'Redshift', category: 'Data Warehouses' },
    { value: 'databricks', label: 'Databricks', category: 'Data Warehouses' },
  ];

  const handleNext = () => {
    if (currentStep === 1 && (!projectName || !projectDescription)) {
      toast.error('Please fill in all project details');
      return;
    }
    if (currentStep === 2 && !dataSourceType) {
      toast.error('Please select a data source');
      return;
    }
    if (currentStep === 3 && !connectionTested) {
      toast.error('Please test the connection first');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const config: DataSourceConfig = {
        type: dataSourceType as any,
        connectionParams,
        queryOrPath,
      };

      const result = await mlApiService.testConnection(config);
      
      if (result.status === 'success') {
        toast.success('Connection successful!');
        setConnectionTested(true);

        // Load preview
        const preview = await mlApiService.previewData(config, 5);
        setPreviewData(preview);
      } else {
        toast.error(result.message || 'Connection failed');
        setConnectionTested(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to test connection');
      setConnectionTested(false);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Create project
      const project = await mlApiService.createProject(projectName, projectDescription);

      // Set data source
      const config: DataSourceConfig = {
        type: dataSourceType as any,
        connectionParams,
        queryOrPath,
      };
      await mlApiService.setProjectDataSource(project.id, config);

      toast.success('Project created successfully!');
      onComplete(project.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                placeholder="e.g., Customer Churn Prediction"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="projectDescription">Description *</Label>
              <Textarea
                id="projectDescription"
                placeholder="Describe your ML project and its objectives..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Rocket className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Getting Started</h4>
                  <p className="text-sm text-muted-foreground">
                    Give your project a descriptive name and explain what you want to predict.
                    In the next steps, you'll connect your data source and configure your model.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="dataSource">Select Data Source *</Label>
              <select
                id="dataSource"
                value={dataSourceType}
                onChange={(e) => setDataSourceType(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Choose a data source...</option>
                {['Files', 'Databases', 'Cloud Storage', 'Data Warehouses'].map((category) => (
                  <optgroup key={category} label={category}>
                    {dataSourceOptions
                      .filter((opt) => opt.category === category)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {dataSourceType && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dataSourceOptions
                  .filter((opt) => opt.value === dataSourceType)
                  .map((opt) => (
                    <Card key={opt.value} className="p-4 border-2 border-primary">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Database className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.category}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supported Data Sources
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Files: CSV, Parquet, JSON</li>
                <li>• Databases: MySQL, PostgreSQL, SQL Server, Oracle</li>
                <li>• Cloud: AWS S3, Google Cloud Storage, Azure Blob</li>
                <li>• Warehouses: BigQuery, Snowflake, Redshift, Databricks</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <DataSourceConfigForm
              dataSourceType={dataSourceType}
              connectionParams={connectionParams}
              queryOrPath={queryOrPath}
              onConnectionParamsChange={setConnectionParams}
              onQueryOrPathChange={setQueryOrPath}
            />

            <div className="flex items-center gap-3">
              <Button
                onClick={handleTestConnection}
                disabled={testingConnection}
                variant="outline"
                className="flex-1"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : connectionTested ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Connection Successful
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {previewData && (
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium mb-3">Data Preview</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {previewData.columns?.map((col: string) => (
                          <th key={col} className="text-left p-2 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data?.slice(0, 5).map((row: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          {previewData.columns?.map((col: string) => (
                            <td key={col} className="p-2">
                              {String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Showing 5 of {previewData.totalRows || 0} rows
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-lg">Ready to Create Project!</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Review your project configuration below and click "Create Project" to continue.
              </p>
            </div>

            <Card className="p-6 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Project Name</div>
                <div className="font-medium">{projectName}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Description</div>
                <div className="text-sm">{projectDescription}</div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground mb-1">Data Source</div>
                <div className="font-medium">
                  {dataSourceOptions.find((opt) => opt.value === dataSourceType)?.label}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Query/Path</div>
                <div className="text-sm font-mono bg-muted p-2 rounded">
                  {queryOrPath}
                </div>
              </div>

              {previewData && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Data Info</div>
                  <div className="text-sm">
                    {previewData.columns?.length || 0} columns, {previewData.totalRows || 0} rows
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : isActive
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <Icon
                          className={`h-6 w-6 ${
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`}
                        />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <div
                        className={`text-sm font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}

              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Data Source Configuration Form Component
function DataSourceConfigForm({
  dataSourceType,
  connectionParams,
  queryOrPath,
  onConnectionParamsChange,
  onQueryOrPathChange,
}: any) {
  const updateParam = (key: string, value: any) => {
    onConnectionParamsChange({ ...connectionParams, [key]: value });
  };

  const renderConfigFields = () => {
    switch (dataSourceType) {
      case 'csv':
        return (
          <>
            <div>
              <Label>File Path *</Label>
              <Input
                value={queryOrPath}
                onChange={(e) => onQueryOrPathChange(e.target.value)}
                placeholder="/path/to/data.csv"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Encoding</Label>
              <Input
                value={connectionParams.encoding || 'utf-8'}
                onChange={(e) => updateParam('encoding', e.target.value)}
                placeholder="utf-8"
                className="mt-2"
              />
            </div>
          </>
        );

      case 'mysql':
      case 'postgresql':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Host *</Label>
                <Input
                  value={connectionParams.host || ''}
                  onChange={(e) => updateParam('host', e.target.value)}
                  placeholder="localhost"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  type="number"
                  value={connectionParams.port || (dataSourceType === 'mysql' ? 3306 : 5432)}
                  onChange={(e) => updateParam('port', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>Database *</Label>
              <Input
                value={connectionParams.database || ''}
                onChange={(e) => updateParam('database', e.target.value)}
                placeholder="my_database"
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={connectionParams.username || ''}
                  onChange={(e) => updateParam('username', e.target.value)}
                  placeholder="user"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={connectionParams.password || ''}
                  onChange={(e) => updateParam('password', e.target.value)}
                  placeholder="••••••••"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>SQL Query *</Label>
              <Textarea
                value={queryOrPath}
                onChange={(e) => onQueryOrPathChange(e.target.value)}
                placeholder="SELECT * FROM customers WHERE active = true"
                className="mt-2 font-mono text-sm"
              />
            </div>
          </>
        );

      case 'bigquery':
        return (
          <>
            <div>
              <Label>Project ID *</Label>
              <Input
                value={connectionParams.project_id || ''}
                onChange={(e) => updateParam('project_id', e.target.value)}
                placeholder="my-gcp-project"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Credentials Path</Label>
              <Input
                value={connectionParams.credentials_path || ''}
                onChange={(e) => updateParam('credentials_path', e.target.value)}
                placeholder="/path/to/credentials.json"
                className="mt-2"
              />
            </div>
            <div>
              <Label>SQL Query *</Label>
              <Textarea
                value={queryOrPath}
                onChange={(e) => onQueryOrPathChange(e.target.value)}
                placeholder="SELECT * FROM `project.dataset.table` LIMIT 1000"
                className="mt-2 font-mono text-sm"
              />
            </div>
          </>
        );

      case 's3':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>AWS Access Key</Label>
                <Input
                  value={connectionParams.aws_access_key_id || ''}
                  onChange={(e) => updateParam('aws_access_key_id', e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>AWS Secret Key</Label>
                <Input
                  type="password"
                  value={connectionParams.aws_secret_access_key || ''}
                  onChange={(e) => updateParam('aws_secret_access_key', e.target.value)}
                  placeholder="••••••••"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bucket *</Label>
                <Input
                  value={connectionParams.bucket || ''}
                  onChange={(e) => updateParam('bucket', e.target.value)}
                  placeholder="my-data-bucket"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Region</Label>
                <Input
                  value={connectionParams.region || 'us-east-1'}
                  onChange={(e) => updateParam('region', e.target.value)}
                  placeholder="us-east-1"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>File Key/Path *</Label>
              <Input
                value={queryOrPath}
                onChange={(e) => onQueryOrPathChange(e.target.value)}
                placeholder="data/customers.csv"
                className="mt-2"
              />
            </div>
          </>
        );

      case 'snowflake':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Account *</Label>
                <Input
                  value={connectionParams.account || ''}
                  onChange={(e) => updateParam('account', e.target.value)}
                  placeholder="xy12345.us-east-1"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Warehouse *</Label>
                <Input
                  value={connectionParams.warehouse || ''}
                  onChange={(e) => updateParam('warehouse', e.target.value)}
                  placeholder="COMPUTE_WH"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Database *</Label>
                <Input
                  value={connectionParams.database || ''}
                  onChange={(e) => updateParam('database', e.target.value)}
                  placeholder="PRODUCTION"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Schema</Label>
                <Input
                  value={connectionParams.schema || 'public'}
                  onChange={(e) => updateParam('schema', e.target.value)}
                  placeholder="public"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={connectionParams.user || ''}
                  onChange={(e) => updateParam('user', e.target.value)}
                  placeholder="ml_user"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={connectionParams.password || ''}
                  onChange={(e) => updateParam('password', e.target.value)}
                  placeholder="••••••••"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label>SQL Query *</Label>
              <Textarea
                value={queryOrPath}
                onChange={(e) => onQueryOrPathChange(e.target.value)}
                placeholder="SELECT * FROM customers"
                className="mt-2 font-mono text-sm"
              />
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Select a data source to configure connection
          </div>
        );
    }
  };

  return <div className="space-y-4">{renderConfigFields()}</div>;
}
