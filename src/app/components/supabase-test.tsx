import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [testData, setTestData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('products').select('count').single();
      
      if (error) {
        console.error('Supabase connection error:', error);
        setConnectionStatus('error');
        setError(error.message);
      } else {
        console.log('Supabase connected successfully');
        setConnectionStatus('connected');
        
        // Test fetching sample data
        await fetchTestData();
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('error');
      setError('Failed to connect to Supabase');
    }
  };

  const fetchTestData = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (error) {
        console.error('Error fetching test data:', error);
        setError(error.message);
      } else {
        console.log('Test data fetched:', data);
        setTestData(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch test data:', err);
      setError('Failed to fetch test data');
    }
  };

  const createTestProduct = async () => {
    try {
      const testProduct = {
        name: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        unit: 'kg',
        stock_quantity: 100,
        category: 'vegetables',
        seller_id: '00000000-0000-0000-0000-000000000003'
      };

      const { data, error } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();

      if (error) {
        console.error('Error creating test product:', error);
        setError(error.message);
      } else {
        console.log('Test product created:', data);
        await fetchTestData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to create test product:', err);
      setError('Failed to create test product');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Connection Status:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {connectionStatus === 'connected' ? '✅ Connected' :
               connectionStatus === 'error' ? '❌ Error' :
               '⏳ Loading...'}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Test Data */}
          {testData.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Sample Products:</h3>
              <div className="space-y-2">
                {testData.map((product) => (
                  <div key={product.id} className="p-2 bg-gray-50 rounded">
                    <strong>{product.name}</strong> - ₹{product.price}/{product.unit}
                    <br />
                    <span className="text-sm text-gray-600">Stock: {product.stock_quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="flex gap-2">
            <Button onClick={testConnection} variant="outline">
              Test Connection
            </Button>
            <Button onClick={fetchTestData} variant="outline">
              Fetch Test Data
            </Button>
            <Button onClick={createTestProduct} variant="outline">
              Create Test Product
            </Button>
          </div>

          {/* Environment Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-800">Environment Info:</h3>
            <p className="text-sm text-blue-700">
              Supabase URL: https://mkreptkluqmlrjhhjhun.supabase.co
            </p>
            <p className="text-sm text-blue-700">
              Project ID: mkreptkluqmlrjhhjhun
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
