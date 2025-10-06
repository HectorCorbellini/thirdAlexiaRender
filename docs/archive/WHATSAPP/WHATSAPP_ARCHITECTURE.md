# WhatsApp Integration System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Alexia Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Frontend  │  │   Backend   │  │   WhatsApp Service      │  │
│  │   (React)   │◄─┤   (Node)    │◄─┤   (whatsapp-web.js)     │  │
│  │             │  │             │  │                         │  │
│  │ • Chat UI   │  │ • REST API  │  │ • Session Management    │  │
│  │ • Real-time │  │ • Message   │  │ • Message Processing    │  │
│  │   Updates   │  │   Handler   │  │ • Media Handling        │  │
│  │ • Contact   │  │ • Lead      │  │ • Authentication        │  │
│  │   List      │  │   Creation  │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Database   │  │ WebSocket   │  │   Redis Cache           │  │
│  │  (MongoDB/  │◄─┤  Server     │◄─┤   (Message Queue)       │  │
│  │  PostgreSQL)│  │ (Socket.IO) │  │                         │  │
│  │             │  │             │  │ • Session Storage       │  │
│  │ • Messages  │  │ • Real-time │  │ • Rate Limiting         │  │
│  │ • Contacts  │  │   Updates   │  │ • Temporary Data        │  │
│  │ • Sessions  │  │ • Live Chat │  │                         │  │
│  │ • Businesses│  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Architecture

### **1. WhatsApp Service Layer**

#### **WhatsAppClientManager**
```typescript
class WhatsAppClientManager {
  private clients: Map<string, Client> = new Map()
  private sessionManager: SessionManager
  private messageProcessor: MessageProcessor

  async initializeClient(sessionId: string): Promise<Client>
  async authenticateWithQR(): Promise<string>
  async sendMessage(to: string, content: string): Promise<Message>
  async handleIncomingMessage(message: any): Promise<void>
  async getContacts(): Promise<Contact[]>
  async disconnectClient(sessionId: string): Promise<void>
}
```

#### **SessionManager**
```typescript
class SessionManager {
  private redis: RedisClient
  private sessionPath: string

  async createSession(userId: string): Promise<Session>
  async getSession(sessionId: string): Promise<Session | null>
  async updateSessionActivity(sessionId: string): Promise<void>
  async deleteSession(sessionId: string): Promise<void>
  async generateQRCode(): Promise<string>
}
```

#### **MessageProcessor**
```typescript
class MessageProcessor {
  private messageHandler: MessageHandler
  private leadGenerator: LeadGenerator
  private businessMatcher: BusinessMatcher

  async processIncoming(message: WhatsAppMessage): Promise<void>
  async processOutgoing(message: OutgoingMessage): Promise<void>
  async generateResponse(message: WhatsAppMessage): Promise<string>
  async createLeadFromMessage(message: WhatsAppMessage): Promise<Lead>
}
```

### **2. Backend API Layer**

#### **WhatsAppController**
```typescript
@RestController
class WhatsAppController {
  @Post('/sessions')
  async createSession(@Body() request: CreateSessionRequest)

  @Get('/sessions/:id/qr')
  async getQRCode(@Param('id') sessionId: string)

  @Post('/messages')
  async sendMessage(@Body() request: SendMessageRequest)

  @Get('/conversations')
  async getConversations(@Query() filters: ConversationFilters)

  @Get('/contacts')
  async getContacts(@Query() filters: ContactFilters)
}
```

#### **MessageHandler**
```typescript
class MessageHandler {
  private messageRepository: MessageRepository
  private conversationRepository: ConversationRepository
  private websocketEmitter: WebSocketEmitter

  async handleIncoming(message: WhatsAppMessage): Promise<void>
  async handleOutgoing(message: OutgoingMessage): Promise<void>
  async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void>
  async emitRealTimeUpdate(update: RealTimeUpdate): Promise<void>
}
```

### **3. Database Layer**

#### **MessageRepository**
```typescript
class MessageRepository {
  async save(message: Message): Promise<void>
  async findByConversation(conversationId: string): Promise<Message[]>
  async findById(messageId: string): Promise<Message | null>
  async updateStatus(messageId: string, status: MessageStatus): Promise<void>
  async search(query: string, filters: MessageFilters): Promise<Message[]>
}
```

#### **ConversationRepository**
```typescript
class ConversationRepository {
  async save(conversation: Conversation): Promise<void>
  async findByParticipant(participantId: string): Promise<Conversation[]>
  async findById(conversationId: string): Promise<Conversation | null>
  async updateLastMessage(conversationId: string, message: string): Promise<void>
}
```

### **4. Real-Time Layer**

#### **WebSocketGateway**
```typescript
@WebSocketGateway()
class WhatsAppWebSocketGateway {
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(client: Socket, conversationId: string)

  @SubscribeMessage('send_message')
  async handleSendMessage(client: Socket, data: SendMessageData)

  @SubscribeMessage('typing_start')
  async handleTypingStart(client: Socket, conversationId: string)

  async emitMessageUpdate(conversationId: string, message: Message)
  async emitTypingIndicator(conversationId: string, userId: string, isTyping: boolean)
}
```

## 📊 Data Flow Architecture

### **Message Sending Flow**
```
1. User types message in UI
2. Frontend sends POST /messages to Backend
3. Backend validates and processes message
4. WhatsAppService sends message via whatsapp-web.js
5. Message status tracked in database
6. Real-time update sent via WebSocket
7. UI shows sent confirmation and status
```

### **Message Receiving Flow**
```
1. WhatsApp Web receives message
2. whatsapp-web.js emits 'message' event
3. WhatsAppService processes incoming message
4. Message saved to database
5. Lead generation logic triggered if applicable
6. Real-time update sent via WebSocket
7. UI displays new message
```

### **Authentication Flow**
```
1. User requests new WhatsApp session
2. Backend creates session record
3. WhatsAppService initializes whatsapp-web.js client
4. QR code generated and sent to frontend
5. User scans QR code in WhatsApp mobile app
6. Authentication completed and session activated
```

## 🔒 Security Architecture

### **Authentication & Authorization**
- **Session-based auth** for WhatsApp Web connections
- **JWT tokens** for API access
- **Role-based permissions** for different user types
- **Rate limiting** to prevent abuse

### **Data Protection**
- **Message encryption** at rest and in transit
- **Secure credential storage** for WhatsApp sessions
- **GDPR compliance** for user data handling
- **Audit logging** for all WhatsApp interactions

### **WhatsApp Account Protection**
- **Rate limiting** to avoid API bans
- **Session rotation** for load distribution
- **Health monitoring** and automatic recovery
- **Graceful degradation** on connection issues

## 📈 Scalability Architecture

### **Horizontal Scaling**
- **Multiple WhatsApp clients** across different sessions
- **Load balancing** for message distribution
- **Database sharding** for message storage
- **Redis clustering** for session management

### **Performance Optimization**
- **Message queuing** with Redis for high throughput
- **Database indexing** for fast message retrieval
- **Caching layer** for frequently accessed data
- **Connection pooling** for database efficiency

### **Monitoring & Alerting**
- **Real-time metrics** collection
- **Performance monitoring** dashboards
- **Error tracking** and alerting
- **WhatsApp API usage** monitoring

## 🛠️ Development Architecture

### **Environment Configuration**
```typescript
interface WhatsAppConfig {
  sessionPath: string
  qrCodePath: string
  redis: {
    host: string
    port: number
    password?: string
  }
  rateLimiting: {
    messagesPerHour: number
    maxRetries: number
  }
  puppeteer: {
    headless: boolean
    args: string[]
  }
}
```

### **Error Handling Strategy**
- **Retry logic** for failed message sends
- **Circuit breaker** pattern for WhatsApp API
- **Graceful degradation** on service failures
- **Comprehensive logging** for debugging

### **Testing Architecture**
- **Unit tests** for individual components
- **Integration tests** for WhatsApp service
- **E2E tests** for complete message flows
- **Mock services** for isolated testing

This architecture provides a robust, scalable foundation for WhatsApp Web integration in Alexia, supporting real-time messaging, lead generation, and business process automation while maintaining security and performance standards.
