import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Activity,
  Loader2,
  Users,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { analyticsAPI } from "@/services/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const CHART_HEIGHT = 300;
const PIE_CHART_OUTER_RADIUS = 80;
const Y_AXIS_WIDTH = 100;

export function SimpleAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['full-analytics'],
    queryFn: async () => {
      const [overview, categories, cities, weeklyActivity, activityFeed] = await Promise.all([
        analyticsAPI.getOverview().then(res => res.data),
        analyticsAPI.getCategories().then(res => res.data),
        analyticsAPI.getCities().then(res => res.data),
        analyticsAPI.getWeeklyActivity().then(res => res.data),
        analyticsAPI.getActivityFeed().then(res => res.data),
      ]);
      return { overview, categories, cities, weeklyActivity, activityFeed };
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to load analytics data');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">Failed to load analytics</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const analyticsStats = data?.overview ? [
    { title: 'Total Leads', value: data.overview.totalLeads, description: "Sales opportunities", change: '+12.5%', trend: 'up', icon: TrendingUp },
    { title: 'Active Users', value: data.overview.activeWhatsAppUsers, description: "WhatsApp users", change: '+8.2%', trend: 'up', icon: Users },
    { title: 'Conversations', value: data.overview.totalConversations, description: "Chat sessions", change: '+23.1%', trend: 'up', icon: MessageSquare },
    { title: 'Messages', value: data.overview.totalMessages, description: "Total messages", change: '+15.3%', trend: 'up', icon: Activity },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track performance and user engagement metrics</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsStats.map((stat, index) => (
          <StatsCard key={index} stat={stat} index={index} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Messages and leads over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.weeklyActivity && data.weeklyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={data.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="messages" fill="#3B82F6" name="Messages" />
                  <Bar dataKey="leads" fill="#10B981" name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No weekly activity data available</p>
            )}
          </CardContent>
        </Card>

        {/* Business Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Business Categories</CardTitle>
            <CardDescription>Distribution by category type</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.categories && data.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <PieChart>
                  <Pie
                    data={data.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={PIE_CHART_OUTER_RADIUS}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.categories.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* City Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by City</CardTitle>
          <CardDescription>Message volume and business count by major cities</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.cities && data.cities.length > 0 ? (
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={data.cities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" width={Y_AXIS_WIDTH} />
                <Tooltip />
                <Legend />
                <Bar dataKey="messages" fill="#3B82F6" name="Messages" />
                <Bar dataKey="businesses" fill="#10B981" name="Businesses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No city data available</p>
          )}
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-success animate-pulse" />
            <CardTitle>Live Activity Feed</CardTitle>
          </div>
          <CardDescription>Real-time WhatsApp interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.activityFeed?.map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full animate-pulse ${
                    activity.type === "lead" ? "bg-success" :
                    activity.type === "click" ? "bg-warning" :
                    activity.type === "location" ? "bg-info" : "bg-primary"
                  }`}></div>
                  <div>
                    <span className="font-medium">{activity.user}</span> {activity.action}
                    <Badge variant="outline" className="ml-2 text-xs">{activity.city}</Badge>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
