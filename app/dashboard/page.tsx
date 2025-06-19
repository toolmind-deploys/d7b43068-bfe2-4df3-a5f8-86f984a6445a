import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

async function getDashboardData() {
  try {
    const res = await fetch('http://localhost:3000/api/dashboard', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { error: 'Failed to load dashboard data' };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (data.error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{data.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items?.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{item.description}</p>
              {item.status && (
                <div className="mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}