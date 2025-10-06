import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { StatItem } from "@/types"

interface StatsCardProps {
  stat: StatItem
  index?: number
}

export function StatsCard({ stat, index = 0 }: StatsCardProps) {
  return (
    <Card 
      key={index} 
      className="animate-fade-in" 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <stat.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{stat.description}</span>
          <div className="flex items-center">
            {stat.trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 text-success" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-destructive" />
            )}
            <Badge 
              variant={stat.trend === "up" ? "success" : "destructive"}
              className="ml-1"
            >
              {stat.change}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
