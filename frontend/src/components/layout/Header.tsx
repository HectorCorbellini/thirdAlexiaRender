import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Menu, LogOut, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface HeaderProps {
  title: string
  onMenuToggle?: () => void
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">Manage your WhatsApp AI assistant</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses, campaigns..."
            className="w-64 pl-10"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="hidden md:inline text-muted-foreground">{user.name}</span>
            <Badge variant="secondary" className="hidden md:inline">{user.role}</Badge>
          </div>
        )}

        {/* Logout */}
        <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}