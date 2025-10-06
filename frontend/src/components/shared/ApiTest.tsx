import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';

export const ApiTest = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await api.get('/health', {
        baseURL: 'http://localhost:3001'
      });
      setHealthData(response.data);
      setBackendStatus('connected');
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Backend API Status
          <Badge variant={backendStatus === 'connected' ? 'default' : backendStatus === 'error' ? 'destructive' : 'secondary'}>
            {backendStatus === 'connected' && '✓ Connected'}
            {backendStatus === 'error' && '✗ Error'}
            {backendStatus === 'checking' && '⏳ Checking...'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {healthData && (
          <div className="space-y-2 text-sm">
            <p><strong>Status:</strong> {healthData.status}</p>
            <p><strong>Version:</strong> {healthData.version}</p>
            <p><strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
          </div>
        )}
        {backendStatus === 'error' && (
          <p className="text-red-500">Failed to connect to backend API at http://localhost:3001</p>
        )}
      </CardContent>
    </Card>
  );
};
