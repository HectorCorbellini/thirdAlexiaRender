import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard,
  Bot,
  Zap,
  UserPlus
} from "lucide-react"

interface SidebarProps {
  className?: string
  activeSection: string
  onSectionChange: (section: string) => void
}

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, id: "dashboard", badge: null },
  { name: "Businesses", icon: Building2, id: "businesses", badge: "342" },
  { name: "Messaging Bots", icon: Bot, id: "messaging", badge: "1" },
  { name: "Chat Simulator", icon: MessageSquare, id: "chat", badge: null },
  { name: "Campaigns", icon: Zap, id: "campaigns", badge: "12" },
  { name: "Leads", icon: UserPlus, id: "leads", badge: "89" },
  { name: "Analytics", icon: BarChart3, id: "analytics", badge: null },
  { name: "CRM Connections", icon: Users, id: "crm", badge: "5" },
  { name: "Billing", icon: CreditCard, id: "billing", badge: null },
  { name: "Settings", icon: Settings, id: "settings", badge: null },
]

export function Sidebar({ className, activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className={cn("flex h-full w-64 flex-col bg-red-50 border-r", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">ALEXIA</h1>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-10",
              activeSection === item.id && "bg-primary text-primary-foreground shadow-sm"
            )}
            onClick={() => onSectionChange(item.id)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            <span className="flex-1 text-left">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-xs font-medium text-white">AD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@alexia.ai</p>
          </div>
        </div>
      </div>
    </div>
  )
}