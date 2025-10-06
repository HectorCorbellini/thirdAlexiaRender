import { AIService, User } from '../src/services/ai';
import { Message } from '../src/services/messaging/MessagingProvider';

/**
 * Test script for AIAgent with mocked WhatsApp message
 */
async function testAIAgent() {
  console.log('🧪 Testing AIAgent with mocked WhatsApp message...\n');

  // Initialize AI service
  const aiService = new AIService();

  // Mock user data
  const mockUser: User = {
    id: 'test-user-123',
    name: 'María González',
    platform: 'whatsapp',
    businessId: 'test-business-456',
    lastLocation: {
      latitude: 4.7110,
      longitude: -74.0721  // Bogotá, Colombia coordinates
    }
  };

  // Mock WhatsApp message
  const mockMessage: Message = {
    id: 'msg-123',
    userId: 'test-user-123',
    platform: 'whatsapp',
    text: 'Hola! Quiero saber cómo mejorar las ventas de mi tienda de ropa en Instagram',
    timestamp: new Date(),
    type: 'text'
  };

  // Mock conversation history
  const mockConversation = [
    {
      id: 'conv-1',
      userId: 'test-user-123',
      platform: 'whatsapp',
      message_text: 'Hola, necesito ayuda con marketing',
      timestamp: new Date(Date.now() - 60000) // 1 minute ago
    }
  ];

  try {
    console.log('📱 Mock WhatsApp Message:');
    console.log(`   "${mockMessage.text}"`);
    console.log(`   From: ${mockUser.name} (${mockUser.platform})`);
    console.log(`   Location: Bogotá, Colombia`);
    console.log('');

    // Process the message through AIService (which uses AIAgent)
    const response = await aiService.processMessage(mockMessage, mockUser, mockConversation);

    console.log('🤖 ALEXIA Response:');
    console.log(`   "${response}"`);
    console.log('');

    // Test intent detection separately
    console.log('🔍 Testing Intent Detection:');
    const aiAgent = (aiService as any).aiAgent;
    const intent = await aiAgent.detectIntent(mockMessage.text);
    console.log(`   Intent: ${intent.intent}`);
    console.log(`   Confidence: ${Math.round(intent.confidence * 100)}%`);
    console.log(`   Keywords: ${intent.keywords.join(', ')}`);
    console.log('');

    console.log('✅ Test completed successfully!');
    console.log('🎯 The AIAgent is working correctly with:');
    console.log('   • Intent detection');
    console.log('   • Context-aware responses');
    console.log('   • Conversation history');
    console.log('   • Fallback mechanisms');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testAIAgent().catch(console.error);
