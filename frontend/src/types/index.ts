export interface Business {
  id: string
  name: string
  category: string[]
  address: string
  city: string
  phone: string
  whatsapp: string
  rating: number
  ratingCount: number
  verified: boolean
  sponsored: boolean
  owner?: string
  distance?: string
}

export interface Lead {
  id: string
  businessName: string
  userFullName: string
  phone: string
  email?: string
  query: string
  source: "data_alexia" | "web"
  status: "new" | "contacted" | "qualified" | "won" | "lost"
  createdAt: Date
  city: string
  distance: string
  campaignId?: string
  crmSyncStatus?: "success" | "error" | "pending"
}

export interface Message {
  id: string
  content: string
  sender: "user" | "alexia"
  timestamp: Date
  type?: "text" | "location" | "business_result"
  businesses?: Business[]
}

export interface StatItem {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  description: string
}
