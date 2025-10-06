import { useQuery } from "@tanstack/react-query"
import { StatsCard } from "@/components/shared/StatsCard"
import { analyticsAPI } from "@/services/api"
import { Loader2 } from "lucide-react"
import { Users, MessageSquare, TrendingUp, Activity } from "lucide-react"

export function DashboardStats() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await analyticsAPI.getOverview()
      return response.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = [
    {
      title: "Total Leads",
      value: analytics?.totalLeads || 0,
      description: "Sales opportunities",
      change: "+12.5%",
      trend: "up" as const,
      icon: TrendingUp
    },
    {
      title: "Active Users",
      value: analytics?.activeWhatsAppUsers || 0,
      description: "WhatsApp users",
      change: "+8.2%",
      trend: "up" as const,
      icon: Users
    },
    {
      title: "Conversations",
      value: analytics?.totalConversations || 0,
      description: "Chat sessions",
      change: "+23.1%",
      trend: "up" as const,
      icon: MessageSquare
    },
    {
      title: "Messages",
      value: analytics?.totalMessages || 0,
      description: "Total messages",
      change: "+15.3%",
      trend: "up" as const,
      icon: Activity
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} stat={stat} index={index} />
      ))}
    </div>
  )
}