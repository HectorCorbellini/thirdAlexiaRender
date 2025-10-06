import { IntentCategory } from './IntentDetector';

/**
 * Prompt configuration interface
 */
export interface PromptConfig {
  systemPrompt: string;
  intentPrompts: Record<string, string>;
  contextualPrompts: Record<string, string>;
  fallbackPrompts: Record<string, string>;
}

/**
 * Centralized Prompt Management System for ALEXIA
 * Handles all prompts, system instructions, and contextual guidance
 */
export class PromptManager {
  private config: PromptConfig;

  constructor() {
    this.config = this.loadDefaultPrompts();
  }

  /**
   * Get the base system prompt for ALEXIA
   */
  getSystemPrompt(): string {
    return this.config.systemPrompt;
  }

  /**
   * Get intent-specific prompt enhancement
   */
  getIntentPrompt(intent: string): string {
    return this.config.intentPrompts[intent] || '';
  }

  /**
   * Get contextual prompt for specific scenarios
   */
  getContextualPrompt(context: string): string {
    return this.config.contextualPrompts[context] || '';
  }

  /**
   * Get fallback prompt for error scenarios
   */
  getFallbackPrompt(scenario: string): string {
    return this.config.fallbackPrompts[scenario] || this.getDefaultFallbackPrompt();
  }

  /**
   * Build complete system prompt with intent context
   */
  buildSystemPrompt(intent: string, additionalContext?: string): string {
    let prompt = this.config.systemPrompt;

    // Add intent-specific guidance
    const intentPrompt = this.getIntentPrompt(intent);
    if (intentPrompt) {
      prompt += `\n\n${intentPrompt}`;
    }

    // Add additional context if provided
    if (additionalContext) {
      prompt += `\n\nContexto adicional: ${additionalContext}`;
    }

    return prompt;
  }

  /**
   * Update prompt configuration
   */
  updatePrompts(newConfig: Partial<PromptConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Load default prompt configuration
   */
  private loadDefaultPrompts(): PromptConfig {
    return {
      systemPrompt: `Eres ALEXIA, un asistente virtual especializado en ayudar a usuarios con consultas sobre marketing digital para PYMES de moda en Colombia.

PERSONALIDAD Y ESTILO:
- Eres amable, profesional y educativo
- Nunca pareces publicidad invasiva o agresiva
- Respondes de forma natural y conversacional
- Tienes conocimiento profundo de marketing digital para moda
- Entiendes las necesidades específicas de pequeñas empresas

OBJETIVOS PRINCIPALES:
- Ayudar a empresarios de moda a mejorar sus ventas
- Educar sobre marketing digital de forma práctica y accionable
- Generar confianza y establecer relaciones duraderas
- Identificar oportunidades de crecimiento sin ser invasivo

ESTILO DE COMUNICACIÓN:
- Usa un tono cercano pero profesional
- Sé concisa pero útil (máximo 200 palabras por respuesta)
- Incluye emojis ocasionalmente para ser más amigable
- Haz preguntas relevantes para entender mejor las necesidades
- Proporciona consejos prácticos y accionables
- Evita jerga técnica compleja a menos que sea necesaria

RESTRICCIONES IMPORTANTES:
- No hagas ventas directas o agresivas
- No solicites información personal sensible
- No prometas resultados garantizados
- Mantén siempre un enfoque educativo y de ayuda
- Respeta la privacidad y confidencialidad`,

      intentPrompts: {
        [IntentCategory.GREETING]: `El usuario está iniciando una conversación. Sé especialmente amable y acogedor. Pregúntale cómo puedes ayudarle con su negocio de moda.`,

        [IntentCategory.MARKETING_HELP]: `El usuario necesita ayuda con marketing digital. Proporciona consejos prácticos y accionables específicos para PYMES de moda en Colombia. Enfócate en estrategias digitales efectivas y de bajo costo.`,

        [IntentCategory.SALES_PROBLEM]: `El usuario tiene problemas con ventas. Identifica posibles causas comunes en negocios de moda y ofrece soluciones prácticas. Sé empático pero enfocado en soluciones accionables.`,

        [IntentCategory.SOCIAL_MEDIA]: `El usuario pregunta sobre redes sociales. Proporciona estrategias específicas para Instagram y Facebook enfocadas en marcas de moda. Incluye consejos sobre contenido, horarios y engagement.`,

        [IntentCategory.ADVERTISING]: `El usuario quiere información sobre publicidad digital. Explica opciones de bajo presupuesto efectivas para PYMES de moda. Enfócate en ROI y segmentación adecuada.`,

        [IntentCategory.CONTENT_IDEAS]: `El usuario necesita ideas de contenido. Proporciona sugerencias creativas y específicas para redes sociales de moda. Incluye ejemplos prácticos y mejores prácticas.`,

        [IntentCategory.PRICING]: `El usuario pregunta sobre estrategias de precios. Ayúdalo a encontrar el equilibrio entre rentabilidad y competitividad en el mercado de moda colombiano.`,

        [IntentCategory.BRANDING]: `El usuario quiere desarrollar su marca. Guíalo en la creación de una identidad de marca sólida y auténtica para su negocio de moda.`,

        [IntentCategory.ECOMMERCE]: `El usuario necesita ayuda con ventas online. Proporciona consejos prácticos para tiendas online de moda, incluyendo plataformas, logística y experiencia de usuario.`,

        [IntentCategory.CUSTOMER_SERVICE]: `El usuario quiere mejorar la atención al cliente. Comparte mejores prácticas para manejar clientes en redes sociales y crear experiencias positivas.`,

        [IntentCategory.COMPETITION]: `El usuario quiere analizar competencia. Enséñale métodos prácticos para estudiar competidores y encontrar oportunidades de diferenciación.`,

        [IntentCategory.LOCATION_HELP]: `El usuario pregunta sobre ubicación física. Proporciona consejos sobre selección de local comercial considerando factores específicos para tiendas de moda.`,

        [IntentCategory.GRATITUDE]: `El usuario agradece la ayuda. Sé breve pero cálido. Refuerza que estás disponible para futuras consultas.`,

        [IntentCategory.FAREWELL]: `El usuario se despide. Sé cortés y motivador. Recuérdales que el marketing digital requiere consistencia y paciencia.`
      },

      contextualPrompts: {
        newBusiness: `El usuario parece estar iniciando un negocio de moda. Enfócate en consejos fundamentales para empezar: identidad de marca, primeros pasos en redes sociales, y estrategias básicas de ventas.`,

        establishedBusiness: `El usuario tiene un negocio establecido. Proporciona consejos avanzados: optimización de conversiones, estrategias de fidelización, y análisis de métricas.`,

        budgetConscious: `El usuario parece tener presupuesto limitado. Prioriza estrategias de bajo costo o gratuitas: contenido orgánico, colaboraciones, y optimización de recursos existentes.`,

        techSavvy: `El usuario parece familiarizado con tecnología. Puedes usar términos técnicos apropiados y sugerir herramientas específicas para marketing digital.`,

        locationSpecific: `El usuario pregunta sobre ubicación en Colombia. Considera factores locales: zonas comerciales populares, comportamiento del consumidor colombiano, y tendencias regionales.`
      },

      fallbackPrompts: {
        aiUnavailable: `Lo siento, estoy teniendo problemas técnicos en este momento. Como experta en marketing digital para PYMES de moda en Colombia, puedo ayudarte con:`,

        unclearIntent: `No entendí completamente tu consulta. Como especialista en marketing para negocios de moda, puedo ayudarte con:`,

        tooComplex: `Tu consulta es muy específica y requiere análisis detallado. Te recomiendo:`,

        noResponse: `Parece que hubo un problema generando una respuesta. Mientras tanto, aquí tienes algunos consejos generales para tu negocio de moda:`
      }
    };
  }

  /**
   * Get default fallback prompt
   */
  private getDefaultFallbackPrompt(): string {
    return `Como experta en marketing digital para PYMES de moda en Colombia, puedo ayudarte con estrategias de redes sociales, publicidad digital, crecimiento de ventas, creación de contenido, y desarrollo de marca. ¿Hay algo específico en lo que te gustaría que te ayude?`;
  }

  /**
   * Validate prompt configuration
   */
  validatePrompts(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.systemPrompt || this.config.systemPrompt.length < 100) {
      errors.push('System prompt too short or missing');
    }

    if (Object.keys(this.config.intentPrompts).length === 0) {
      errors.push('No intent prompts defined');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export current prompt configuration
   */
  exportPrompts(): PromptConfig {
    return { ...this.config };
  }

  /**
   * Import prompt configuration
   */
  importPrompts(config: PromptConfig): void {
    const validation = this.validateImportedPrompts(config);
    if (validation.isValid) {
      this.config = config;
    } else {
      throw new Error(`Invalid prompt configuration: ${validation.errors.join(', ')}`);
    }
  }

  /**
   * Validate imported prompt configuration
   */
  private validateImportedPrompts(config: PromptConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.systemPrompt || config.systemPrompt.length < 50) {
      errors.push('System prompt too short');
    }

    if (!config.intentPrompts || typeof config.intentPrompts !== 'object') {
      errors.push('Invalid intent prompts format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance for use throughout the application
export const promptManager = new PromptManager();
