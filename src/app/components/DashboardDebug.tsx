/**
 * Dashboard Debug Component - Shows raw API data
 */
import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import axios from 'axios';

const API_BASE = 'http://192.168.1.147:8000/api/v1';

export function DashboardDebug() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 [DEBUG] Fetching all dashboard data...');
        
        const [modelsRes, deploymentsRes, predictionsRes] = await Promise.all([
          axios.get(`${API_BASE}/evaluation/trained-models`),
          axios.get(`${API_BASE}/predictions/deployed-models`),
          axios.get(`${API_BASE}/predictions/monitoring/stats`),
        ]);

        const result = {
          trainedModels: modelsRes.data.models?.length || 0,
          deployedModels: deploymentsRes.data.models?.length || 0,
          predictions: predictionsRes.data.stats?.totalPredictions || 0,
          avgAccuracy: modelsRes.data.models?.length > 0
            ? (modelsRes.data.models.reduce((sum: number, m: any) => sum + m.accuracy, 0) / modelsRes.data.models.length * 100).toFixed(1)
            : 0,
          rawData: {
            models: modelsRes.data.models?.slice(0, 3),
            deployments: deploymentsRes.data.models?.slice(0, 3),
            stats: predictionsRes.data.stats,
          }
        };

        console.log('✅ [DEBUG] Data fetched:', result);
        setData(result);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ [DEBUG] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading debug data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <Card className="p-6 m-6">
      <h2 className="text-2xl font-bold mb-4">🔍 Dashboard Debug Data</h2>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded">
          <div className="text-sm text-muted-foreground">Trained Models</div>
          <div className="text-3xl font-bold">{data?.trainedModels}</div>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded">
          <div className="text-sm text-muted-foreground">Deployed Models</div>
          <div className="text-3xl font-bold">{data?.deployedModels}</div>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded">
          <div className="text-sm text-muted-foreground">Avg Accuracy</div>
          <div className="text-3xl font-bold">{data?.avgAccuracy}%</div>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded">
          <div className="text-sm text-muted-foreground">Predictions</div>
          <div className="text-3xl font-bold">{data?.predictions}</div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Raw API Response:</h3>
        <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(data?.rawData, null, 2)}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded">
        <p className="text-sm">
          ✅ If you see numbers above, the API is working!<br/>
          ❌ If you see all zeros, check backend at: {API_BASE}
        </p>
      </div>
    </Card>
  );
}