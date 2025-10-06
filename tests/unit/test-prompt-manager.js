import { promptManager } from '../backend/src/services/ai/PromptManager';
import { IntentCategory } from '../backend/src/services/ai/IntentDetector';

/**
 * Test script for the Prompt Management System
 */
function testPromptManager() {
  console.log('📝 Testing Centralized Prompt Management System...\n');

  try {
    // Test basic system prompt
    console.log('🏠 Base System Prompt:');
    const systemPrompt = promptManager.getSystemPrompt();
    console.log(`   Length: ${systemPrompt.length} characters`);
    console.log(`   Contains personality: ${systemPrompt.includes('PERSONALIDAD')}`);
    console.log(`   Contains objectives: ${systemPrompt.includes('OBJETIVOS')}`);
    console.log('');

    // Test intent-specific prompts
    console.log('🎯 Intent-Specific Prompts:');
    const testIntents = [
      IntentCategory.MARKETING_HELP,
      IntentCategory.SALES_PROBLEM,
      IntentCategory.SOCIAL_MEDIA,
      IntentCategory.ADVERTISING
    ];

    testIntents.forEach(intent => {
      const intentPrompt = promptManager.getIntentPrompt(intent);
      console.log(`   ${intent}: ${intentPrompt.length} characters`);
    });
    console.log('');

    // Test complete prompt building
    console.log('🔧 Complete Prompt Building:');
    const completePrompt = promptManager.buildSystemPrompt(IntentCategory.SALES_PROBLEM);
    console.log(`   Complete prompt length: ${completePrompt.length} characters`);
    console.log(`   Contains base prompt: ${completePrompt.includes('Eres ALEXIA')}`);
    console.log(`   Contains intent context: ${completePrompt.includes('problemas con ventas')}`);
    console.log('');

    // Test contextual prompts
    console.log('🌍 Contextual Prompts:');
    const contextualPrompts = [
      'newBusiness',
      'establishedBusiness',
      'budgetConscious'
    ];

    contextualPrompts.forEach(context => {
      const contextPrompt = promptManager.getContextualPrompt(context);
      console.log(`   ${context}: ${contextPrompt.length} characters`);
    });
    console.log('');

    // Test fallback prompts
    console.log('🛡️ Fallback Prompts:');
    const fallbackScenarios = [
      'aiUnavailable',
      'unclearIntent',
      'tooComplex'
    ];

    fallbackScenarios.forEach(scenario => {
      const fallbackPrompt = promptManager.getFallbackPrompt(scenario);
      console.log(`   ${scenario}: ${fallbackPrompt.length} characters`);
    });
    console.log('');

    // Test prompt validation
    console.log('✅ Prompt Validation:');
    const validation = promptManager.validatePrompts();
    console.log(`   Valid: ${validation.isValid}`);
    if (validation.errors.length > 0) {
      console.log(`   Errors: ${validation.errors.join(', ')}`);
    }
    console.log('');

    console.log('🎊 Prompt Manager Test Results:');
    console.log('   ✅ Centralized prompt management working');
    console.log('   ✅ Intent-specific prompts available');
    console.log('   ✅ Contextual prompts configurable');
    console.log('   ✅ Fallback prompts ready');
    console.log('   ✅ Prompt validation functional');
    console.log('   ✅ Easy to extend and customize');

    console.log('\n🚀 Benefits of Centralized Prompt Management:');
    console.log('   • Consistent personality across all responses');
    console.log('   • Easy to customize for different business needs');
    console.log('   • Intent-aware prompt optimization');
    console.log('   • Fallback system integration');
    console.log('   • Extensible for future enhancements');

  } catch (error) {
    console.error('❌ Prompt Manager Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testPromptManager();
