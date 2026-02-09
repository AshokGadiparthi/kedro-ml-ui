/**
 * PII Scanner Component
 * Detect and manage Personally Identifiable Information
 */
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Play,
  Download,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface PIIField {
  column: string;
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name' | 'ip_address';
  confidence: number;
  occurrences: number;
  sample: string;
  masked: boolean;
}

export function PIIScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(true); // Set to true to show results

  // Mock PII detection results
  const piiFindings: PIIField[] = [
    {
      column: 'customer_email',
      type: 'email',
      confidence: 99,
      occurrences: 12450,
      sample: 'john.doe@example.com',
      masked: true,
    },
    {
      column: 'phone_number',
      type: 'phone',
      confidence: 97,
      occurrences: 11234,
      sample: '+1 (555) 123-4567',
      masked: true,
    },
    {
      column: 'credit_card',
      type: 'credit_card',
      confidence: 100,
      occurrences: 8765,
      sample: '4532-****-****-1234',
      masked: true,
    },
    {
      column: 'ssn',
      type: 'ssn',
      confidence: 98,
      occurrences: 9876,
      sample: '***-**-6789',
      masked: true,
    },
    {
      column: 'home_address',
      type: 'address',
      confidence: 92,
      occurrences: 10234,
      sample: '123 Main St, City, ST 12345',
      masked: false,
    },
    {
      column: 'full_name',
      type: 'name',
      confidence: 88,
      occurrences: 12450,
      sample: 'John Doe',
      masked: false,
    },
  ];

  const piiTypeConfig = {
    email: { icon: Mail, label: 'Email Address', severity: 'high', color: 'text-red-600' },
    phone: { icon: Phone, label: 'Phone Number', severity: 'high', color: 'text-orange-600' },
    ssn: { icon: Shield, label: 'SSN', severity: 'critical', color: 'text-red-700' },
    credit_card: { icon: CreditCard, label: 'Credit Card', severity: 'critical', color: 'text-red-700' },
    address: { icon: MapPin, label: 'Address', severity: 'medium', color: 'text-yellow-600' },
    name: { icon: User, label: 'Name', severity: 'medium', color: 'text-yellow-600' },
    ip_address: { icon: Shield, label: 'IP Address', severity: 'low', color: 'text-blue-600' },
  };

  const severityConfig = {
    critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
    low: { label: 'Low', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' },
  };

  const handleScan = async () => {
    setScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }
    
    setScanning(false);
    setScanned(true);
    toast.success('PII scan completed');
  };

  const handleMaskField = (column: string) => {
    toast.success(`Masking applied to ${column}`);
  };

  const criticalCount = piiFindings.filter(f => piiTypeConfig[f.type].severity === 'critical').length;
  const highCount = piiFindings.filter(f => piiTypeConfig[f.type].severity === 'high').length;
  const mediumCount = piiFindings.filter(f => piiTypeConfig[f.type].severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            PII Detection & Masking
          </h1>
          <p className="text-muted-foreground mt-1">
            Automatically detect and protect sensitive personal information
          </p>
        </div>
        <Button onClick={handleScan} disabled={scanning} className="gap-2">
          <Play className="h-4 w-4" />
          {scanning ? 'Scanning...' : 'Scan Dataset'}
        </Button>
      </div>

      {/* Scanning Progress */}
      {scanning && (
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Scanning for PII...</span>
              <span className="text-sm text-muted-foreground">{scanProgress}%</span>
            </div>
            <Progress value={scanProgress} />
          </div>
          <p className="text-sm text-muted-foreground">
            Analyzing columns for email addresses, phone numbers, SSN, credit cards, and more...
          </p>
        </Card>
      )}

      {/* Results Summary */}
      {scanned && !scanning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Total PII Fields</div>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold">{piiFindings.length}</div>
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-900">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Critical</div>
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
            </Card>

            <Card className="p-6 border-orange-200 dark:border-orange-900">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">High</div>
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{highCount}</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Masked</div>
                <EyeOff className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {piiFindings.filter(f => f.masked).length}
              </div>
            </Card>
          </div>

          {/* Compliance Alert */}
          <Card className="p-6 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-400 mb-2">
                  Compliance Warning
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  {criticalCount} critical PII fields detected that require immediate attention for GDPR/CCPA compliance.
                  Recommend applying data masking before using this dataset for model training.
                </p>
              </div>
            </div>
          </Card>

          {/* PII Findings Table */}
          <Card>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Detected PII Fields</h2>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Column</th>
                    <th className="p-4 font-medium">PII Type</th>
                    <th className="p-4 font-medium">Severity</th>
                    <th className="p-4 font-medium">Confidence</th>
                    <th className="p-4 font-medium">Occurrences</th>
                    <th className="p-4 font-medium">Sample</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {piiFindings.map((finding, index) => {
                    const config = piiTypeConfig[finding.type];
                    const Icon = config.icon;
                    const severity = config.severity as 'critical' | 'high' | 'medium' | 'low';

                    return (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-mono text-sm font-medium">{finding.column}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            <span>{config.label}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={severityConfig[severity].color}>
                            {severityConfig[severity].label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Progress value={finding.confidence} className="w-16" />
                            <span className="text-sm text-muted-foreground">{finding.confidence}%</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {finding.occurrences.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {finding.sample}
                          </code>
                        </td>
                        <td className="p-4">
                          {finding.masked ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Masked
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                              <Eye className="h-3 w-3 mr-1" />
                              Exposed
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          {!finding.masked && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMaskField(finding.column)}
                              className="gap-2"
                            >
                              <Shield className="h-3 w-3" />
                              Apply Mask
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recommended Actions
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <div className="font-medium">Apply data masking to critical fields</div>
                  <div className="text-sm text-muted-foreground">
                    Mask SSN and credit card numbers before training ML models
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <div className="font-medium">Update data access policies</div>
                  <div className="text-sm text-muted-foreground">
                    Restrict access to PII fields to authorized users only
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <div className="font-medium">Document compliance measures</div>
                  <div className="text-sm text-muted-foreground">
                    Record PII handling procedures for audit trail
                  </div>
                </div>
              </li>
            </ul>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!scanned && !scanning && (
        <Card className="p-12">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No PII Scan Results</h3>
            <p className="text-muted-foreground mb-6">
              Run a PII scan to detect sensitive information in your datasets
            </p>
            <Button onClick={handleScan} className="gap-2">
              <Play className="h-4 w-4" />
              Start PII Scan
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
