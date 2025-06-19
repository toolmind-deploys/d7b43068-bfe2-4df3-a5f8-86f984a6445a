import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExclamationTriangleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

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

function StatusIndicator({ status }: { status: string }) {
  const statusStyles = {
    completed: 'bg-green-500',
    'in-progress': 'bg-blue-500',
    pending: 'bg-yellow-500',
    cancelled: 'bg-red-500',
  };

  return (
    <Badge variant="secondary" className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-500'}`} />
      {status}
    </Badge>
  );
}

function ListItem({ item }: { item: any }) {
  return (
    <div className="p-4 border-b hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium truncate">{item.title}</h3>
            <StatusIndicator status={item.status} />
          </div>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
          
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>Assigned to: {item.assignedTo}</span>
            <span>•</span>
            <span>Due: {new Date(item.date).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Add New Item</Button>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search items..."
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border divide-y">
            {data.items?.length > 0 ? (
              data.items.map((item: any) => (
                <ListItem key={item.id} item={item} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No items found
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {data.items?.length || 0} items
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}