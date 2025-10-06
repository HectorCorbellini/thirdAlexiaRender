# WhatsApp Integration Database Schema

## 🗄️ Database Design Overview

The database schema is designed to support real-time WhatsApp messaging, conversation management, lead generation, and business process integration. We'll use a relational database approach with MongoDB for flexibility with message data and PostgreSQL for structured business data.

## 📋 Core Collections/Tables

### **1. WhatsApp Sessions**

**Purpose**: Manage WhatsApp Web client sessions and authentication states.

```typescript
// MongoDB Collection: whatsapp_sessions
interface WhatsAppSession {
  _id: ObjectId
  sessionId: string          // Unique session identifier
  userId: ObjectId          // Reference to Alexia user
  businessId?: ObjectId     // Associated business (optional)

  // Connection Status
  status: 'initializing' | 'qr_generated' | 'authenticating' | 'connected' | 'disconnected' | 'banned'
  connectedAt?: Date
  disconnectedAt?: Date
  lastActivity?: Date

  // Session Management
  sessionData: {            // Encrypted session data from whatsapp-web.js
    WABrowserId: string
    WASecretBundle: string
    WAToken1: string
    WAToken2: string
  }

  // QR Code for Authentication
  qrCode?: string
  qrCodeGeneratedAt?: Date
  qrCodeExpiresAt?: Date

  // Usage Statistics
  messageCount: number
  errorCount: number
  lastError?: string
  lastErrorAt?: Date

  // Settings
  autoReconnect: boolean
  rateLimitPerHour: number

  // Metadata
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

// Indexes
// - { sessionId: 1 } - Unique session lookup
// - { userId: 1 } - User's active sessions
// - { status: 1 } - Status-based queries
// - { lastActivity: -1 } - Recent activity sorting
```

### **2. Conversations**

**Purpose**: Track conversation threads between users and businesses.

```typescript
// MongoDB Collection: conversations
interface Conversation {
  _id: ObjectId
  conversationId: string     // Unique conversation identifier

  // Participants
  participants: {
    userId?: ObjectId        // Alexia user (if business owner)
    businessId?: ObjectId    // Alexia business
    whatsappId: string       // WhatsApp participant ID
    name: string            // Display name
    type: 'user' | 'business' | 'group'
  }[]

  // Conversation Metadata
  isGroup: boolean
  groupName?: string
  groupDescription?: string

  // Message Tracking
  lastMessageId?: ObjectId
  lastMessageContent?: string
  lastMessageAt?: Date
  messageCount: number

  // Status Tracking
  unreadCount: { [participantId: string]: number }
  isArchived: boolean
  isPinned: boolean

  // Business Integration
  leadId?: ObjectId         // Generated lead from conversation
  campaignId?: ObjectId     // Associated marketing campaign
  priority: 'low' | 'medium' | 'high'

  // Timestamps
  createdAt: Date
  updatedAt: Date
  archivedAt?: Date
}

// Indexes
// - { participants.whatsappId: 1 } - WhatsApp participant lookup
// - { participants.businessId: 1 } - Business conversations
// - { lastMessageAt: -1 } - Recent conversations
// - { leadId: 1 } - Lead-associated conversations
```

### **3. Messages**

**Purpose**: Store all WhatsApp messages with metadata and status tracking.

```typescript
// MongoDB Collection: messages
interface Message {
  _id: ObjectId
  messageId: string         // WhatsApp message ID
  conversationId: ObjectId  // Reference to conversation

  // Message Direction
  direction: 'incoming' | 'outgoing'
  from: string             // WhatsApp sender ID
  to: string              // WhatsApp recipient ID(s)

  // Content
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker'
  content: string         // Text content or media URL

  // Media Information (for non-text messages)
  media?: {
    url: string           // Local or remote media URL
    fileName: string
    fileSize: number      // in bytes
    mimeType: string
    caption?: string      // Media caption/description
    thumbnailUrl?: string // For videos and documents
  }

  // Message Status
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  statusUpdates: {
    status: string
    timestamp: Date
  }[]

  // Reply Context
  replyTo?: ObjectId       // Message being replied to
  isForwarded: boolean

  // Business Context
  businessId?: ObjectId    // Associated business
  leadGenerated: boolean   // Whether this message generated a lead
  tags: string[]          // Custom tags for categorization

  // Timestamps
  timestamp: Date         // WhatsApp message timestamp
  createdAt: Date
  updatedAt: Date
}

// Indexes
// - { conversationId: 1, timestamp: -1 } - Conversation message history
// - { from: 1, timestamp: -1 } - Messages from specific sender
// - { businessId: 1, timestamp: -1 } - Business-related messages
// - { status: 1 } - Status-based filtering
// - { leadGenerated: 1 } - Lead-generating messages
```

### **4. WhatsApp Contacts**

**Purpose**: Store WhatsApp contact information synchronized from WhatsApp.

```typescript
// MongoDB Collection: whatsapp_contacts
interface WhatsAppContact {
  _id: ObjectId
  whatsappId: string       // WhatsApp user ID
  sessionId: string       // Associated WhatsApp session

  // Contact Information
  name: string
  pushname?: string       // WhatsApp display name
  shortName?: string

  // Profile Information
  profilePictureUrl?: string
  status?: string
  isBusiness: boolean
  isVerified: boolean

  // Contact Details
  phoneNumber: string
  email?: string
  company?: string
  title?: string

  // Alexia Integration
  businessId?: ObjectId   // Linked Alexia business
  leadIds?: ObjectId[]    // Generated leads from this contact

  // Metadata
  lastSeen?: Date
  isOnline: boolean
  isBlocked: boolean

  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastInteractionAt?: Date
}

// Indexes
// - { whatsappId: 1 } - Unique WhatsApp ID lookup
// - { sessionId: 1 } - Session-based contact lookup
// - { businessId: 1 } - Business-linked contacts
// - { phoneNumber: 1 } - Phone number search
```

## 🗂️ Supporting Tables (PostgreSQL)

### **5. WhatsApp Session Logs**

**Purpose**: Track session events and errors for monitoring and debugging.

```sql
CREATE TABLE whatsapp_session_logs (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id),

  event_type VARCHAR(50) NOT NULL, -- 'connected', 'disconnected', 'error', 'qr_generated'
  event_data JSONB,

  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at),
  INDEX idx_event_type (event_type)
);
```

### **6. Message Analytics**

**Purpose**: Store aggregated message statistics for reporting and analytics.

```sql
CREATE TABLE message_analytics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,

  business_id INTEGER REFERENCES businesses(id),
  session_id VARCHAR(255),

  total_messages INTEGER DEFAULT 0,
  incoming_messages INTEGER DEFAULT 0,
  outgoing_messages INTEGER DEFAULT 0,

  unique_contacts INTEGER DEFAULT 0,
  new_leads_generated INTEGER DEFAULT 0,

  average_response_time_minutes DECIMAL(8,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, business_id),
  INDEX idx_date (date),
  INDEX idx_business_id (business_id)
);
```

### **7. Rate Limiting**

**Purpose**: Track API usage for rate limiting and abuse prevention.

```sql
CREATE TABLE rate_limiting (
  id SERIAL PRIMARY KEY,

  identifier VARCHAR(255) NOT NULL, -- IP, user_id, session_id
  identifier_type VARCHAR(50) NOT NULL, -- 'ip', 'user', 'session'

  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,

  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_identifier (identifier, identifier_type),
  INDEX idx_window (window_start, window_end)
);
```

## 🔗 Relationships & Data Flow

### **Entity Relationships**
```
Users (Alexia)
├── WhatsAppSessions (1:N)
├── Conversations (N:M via participants)
└── Leads (1:N)

Businesses (Alexia)
├── WhatsAppSessions (1:N)
├── Conversations (1:N)
├── Messages (1:N)
└── WhatsAppContacts (1:N)

Conversations
├── Messages (1:N)
├── Participants (N:M)
└── Leads (1:1)

Messages
├── Conversations (N:1)
├── Media Files (1:N)
└── Status Updates (1:N)

WhatsAppContacts
├── Conversations (1:N)
├── Messages (1:N)
└── Leads (1:N)
```

### **Data Flow Integration**
1. **Message Received** → Parse → Store in Messages → Update Conversation → Check for Lead Generation → Real-time Update
2. **Message Sent** → Validate → Send via WhatsApp → Store in Messages → Track Status → Update Analytics
3. **Contact Synced** → Store/Update Contact → Link to Conversations → Update Business Association

## 📊 Performance Optimization

### **Indexing Strategy**
- **Compound indexes** for common query patterns
- **Partial indexes** for frequently filtered fields
- **TTL indexes** for temporary data cleanup
- **Text indexes** for message content search

### **Partitioning Strategy**
- **Time-based partitioning** for Messages collection (monthly)
- **Business-based partitioning** for high-volume businesses
- **Archive old conversations** after 6-12 months of inactivity

### **Caching Strategy**
- **Redis caching** for active conversations and contacts
- **Session data caching** for WhatsApp authentication
- **Frequently accessed business data** caching

## 🔒 Data Security & Privacy

### **Encryption**
- **Message content encryption** at rest using AES-256
- **Session data encryption** for WhatsApp credentials
- **TLS encryption** for all data in transit

### **GDPR Compliance**
- **Data retention policies** with automatic deletion
- **User consent tracking** for data processing
- **Right to erasure** implementation
- **Data portability** export functionality

### **Privacy Protection**
- **Anonymization** of personal data where possible
- **Access logging** for all data operations
- **Regular security audits** and penetration testing

This database schema provides a solid foundation for WhatsApp integration, supporting real-time messaging, lead generation, business process automation, and comprehensive analytics while maintaining security and performance standards.
