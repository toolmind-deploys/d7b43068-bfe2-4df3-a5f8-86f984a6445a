import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ExclamationTriangleIcon, ArrowTrendingUpIcon, ClockIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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

function StatCard({ title, value, icon: Icon, trend }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            <span className="text-muted-foreground"> from last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <div className="rounded-full bg-blue-100 p-2">
        <ClockIcon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{activity.title}</p>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      </div>
      <time className="text-sm text-muted-foreground">{activity.time}</time>
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
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.stats.totalUsers}
          icon={UserGroupIcon}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value={data.stats.activeProjects}
          icon={DocumentTextIcon}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Completion Rate"
          value={`${data.stats.completionRate}%`}
          icon={ArrowTrendingUpIcon}
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Total Tasks"
          value={data.stats.totalTasks}
          icon={DocumentTextIcon}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.map((activity: any, index: number) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                Create New Project
              </button>
              <button className="w-full rounded-lg border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                View All Tasks
              </button>
              <button className="w-full rounded-lg border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
                Generate Report
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
