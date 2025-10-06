import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { WhatsAppSimulator } from "@/components/chat/WhatsAppSimulator"
import { BusinessList } from "@/components/businesses/BusinessList"
import { SimpleAnalytics } from "@/components/analytics/SimpleAnalytics"
import { LeadsManager } from "@/components/leads/LeadsManager"
import { ApiTest } from "@/components/shared/ApiTest"
import MessagingIntegrations from "@/components/messaging/MessagingIntegrations"

const sectionTitles = {
  dashboard: "Dashboard",
  businesses: "Businesses",
  messaging: "Messaging Integrations",
  chat: "WhatsApp Simulator", 
  "whatsapp-test": "WhatsApp Test",
  campaigns: "Campaigns",
  leads: "Leads Manager",
  analytics: "Analytics",
  crm: "CRM Connections",
  billing: "Billing",
  settings: "Settings"
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {import.meta.env.MODE === 'development' && <ApiTest />}
            <DashboardStats />
          </div>
        )
      case "businesses":
        return <BusinessList />
      case "messaging":
        return <MessagingIntegrations />
      case "chat":
        return <WhatsAppSimulator />
      case "whatsapp-test":
        window.location.href = "/whatsapp-test";
        return null;
      case "leads":
        return <LeadsManager />
      case "analytics":
        return <SimpleAnalytics />
      case "campaigns":
        return <div className="text-center py-12 text-muted-foreground">Campaigns module coming soon...</div>
      case "crm":
        return <div className="text-center py-12 text-muted-foreground">CRM Connections module coming soon...</div>
      case "billing":
        return <div className="text-center py-12 text-muted-foreground">Billing module coming soon...</div>
      case "settings":
        return <div className="text-center py-12 text-muted-foreground">Settings module coming soon...</div>
      default:
        return <DashboardStats />
    }
  }

  return (
    <div className="flex h-screen bg-blue-50">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        className={sidebarCollapsed ? "hidden" : ""}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-blue-50">
        <Header 
          title={sectionTitles[activeSection as keyof typeof sectionTitles]}
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="flex-1 overflow-y-auto p-6 bg-blue-50">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}