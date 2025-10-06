import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  User, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ExternalLink,
  Filter,
  Search,
  Send,
  Loader2
} from "lucide-react"
import { leadAPI } from "@/services/api"
import { toast } from "sonner"

export function LeadsManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await leadAPI.getAll();
      return response.data.leads; // Extract the 'leads' array
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to load leads')
    }
  })

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = lead.waUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.business?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">Failed to load leads</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      NEW: "info",
      CONTACTED: "warning", 
      QUALIFIED: "whatsapp",
      WON: "success",
      LOST: "destructive"
    }
    
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  const getCrmSyncBadge = (status?: string) => {
    if (!status) return null
    
    const variants: Record<string, any> = {
      success: "success",
      error: "destructive",
      pending: "warning"
    } as const
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const getSourceBadge = (source: string) => {
    return (
      <Badge variant={source === "data_alexia" ? "default" : "info"}>
        {source === "data_alexia" ? "ALEXIA DB" : "WEB"}
      </Badge>
    )
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads Manager</h2>
          <p className="text-muted-foreground">Track and manage potential customers from WhatsApp interactions</p>
        </div>
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Sync All to CRM
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl">{leads.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New</CardDescription>
            <CardTitle className="text-2xl text-info">
              {leads.filter(l => l.status === "new").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Qualified</CardDescription>
            <CardTitle className="text-2xl text-whatsapp">
              {leads.filter(l => l.status === "qualified").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Won</CardDescription>
            <CardTitle className="text-2xl text-success">
              {leads.filter(l => l.status === "won").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion</CardDescription>
            <CardTitle className="text-2xl">
              {((leads.filter(l => l.status === "won").length / leads.length) * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          className="px-3 py-2 border rounded-md bg-background"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{lead.userFullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Interested in <span className="font-medium">{lead.businessName}</span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(lead.status)}
                      {getSourceBadge(lead.source)}
                      {getCrmSyncBadge(lead.crmSyncStatus)}
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm italic">"{lead.query}"</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {lead.phone}
                      </div>
                      {lead.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {lead.email}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {lead.city} • {lead.distance}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTimeAgo(lead.createdAt)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="whatsapp">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          WhatsApp
                        </Button>
                        <Button size="sm" variant="outline">
                          <Send className="h-3 w-3 mr-1" />
                          CRM
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}