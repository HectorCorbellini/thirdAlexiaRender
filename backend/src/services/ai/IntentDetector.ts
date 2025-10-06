/**
 * Enhanced Intent Detection System for ALEXIA
 * Provides sophisticated intent classification with multiple strategies
 */

// Intent categories for fashion/retail businesses
export enum IntentCategory {
  GREETING = 'GREETING',
  MARKETING_HELP = 'MARKETING_HELP',
  SALES_PROBLEM = 'SALES_PROBLEM',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ADVERTISING = 'ADVERTISING',
  CONTENT_IDEAS = 'CONTENT_IDEAS',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  PRICING = 'PRICING',
  COMPETITION = 'COMPETITION',
  BRANDING = 'BRANDING',
  ECOMMERCE = 'ECOMMERCE',
  LOCATION_HELP = 'LOCATION_HELP',
  GRATITUDE = 'GRATITUDE',
  FAREWELL = 'FAREWELL',
  OTHER = 'OTHER'
}

// Intent detection patterns
interface IntentPattern {
  category: IntentCategory;
  keywords: string[];
  phrases: string[];
  priority: number; // Higher priority patterns checked first
  confidence: number; // Base confidence for this pattern
}

// Comprehensive intent patterns for fashion retail
const INTENT_PATTERNS: IntentPattern[] = [
  // High priority patterns (greetings, farewells)
  {
    category: IntentCategory.GREETING,
    keywords: ['hola', 'buenos', 'buenas', 'saludos', 'hello', 'hi'],
    phrases: ['buen día', 'buenas tardes', 'buenas noches', 'cómo estás', 'qué tal'],
    priority: 10,
    confidence: 0.9
  },
  {
    category: IntentCategory.FAREWELL,
    keywords: ['adiós', 'chao', 'bye', 'hasta luego', 'nos vemos', 'gracias'],
    phrases: ['hasta pronto', 'hasta mañana', 'me despido'],
    priority: 10,
    confidence: 0.9
  },

  // Marketing and strategy
  {
    category: IntentCategory.MARKETING_HELP,
    keywords: ['marketing', 'estrategia', 'promoción', 'campaña', 'publicidad'],
    phrases: ['cómo promocionar', 'estrategias de marketing', 'plan de marketing', 'marketing digital'],
    priority: 8,
    confidence: 0.8
  },

  // Sales problems and solutions
  {
    category: IntentCategory.SALES_PROBLEM,
    keywords: ['ventas', 'vender', 'clientes', 'compras', 'conversiones'],
    phrases: ['no vendo', 'bajas ventas', 'aumentar ventas', 'más clientes', 'cómo vender más'],
    priority: 8,
    confidence: 0.8
  },

  // Social media specific
  {
    category: IntentCategory.SOCIAL_MEDIA,
    keywords: ['instagram', 'facebook', 'tiktok', 'redes sociales', 'social media'],
    phrases: ['crecer en instagram', 'estrategia instagram', 'contenido redes', 'seguidores instagram'],
    priority: 8,
    confidence: 0.8
  },

  // Advertising and paid promotion
  {
    category: IntentCategory.ADVERTISING,
    keywords: ['publicidad', 'anuncios', 'ads', 'pauta', 'presupuesto'],
    phrases: ['publicidad pagada', 'anuncios facebook', 'inversión publicidad', 'retorno inversión'],
    priority: 7,
    confidence: 0.7
  },

  // Content creation
  {
    category: IntentCategory.CONTENT_IDEAS,
    keywords: ['contenido', 'posts', 'publicaciones', 'ideas', 'creatividad'],
    phrases: ['qué publicar', 'ideas contenido', 'contenido atractivo', 'posts creativos'],
    priority: 7,
    confidence: 0.7
  },

  // Customer service and experience
  {
    category: IntentCategory.CUSTOMER_SERVICE,
    keywords: ['atención', 'cliente', 'servicio', 'soporte', 'reclamos'],
    phrases: ['mejorar atención', 'experiencia cliente', 'servicio postventa', 'manejar quejas'],
    priority: 7,
    confidence: 0.7
  },

  // Pricing and product strategy
  {
    category: IntentCategory.PRICING,
    keywords: ['precio', 'precios', 'costos', 'tarifas', 'valor'],
    phrases: ['cómo fijar precios', 'estrategia precios', 'aumentar precios', 'precios competitivos'],
    priority: 6,
    confidence: 0.6
  },

  // Competition analysis
  {
    category: IntentCategory.COMPETITION,
    keywords: ['competencia', 'competidores', 'mercado', 'benchmark'],
    phrases: ['analizar competencia', 'qué hace competencia', 'ventaja competitiva', 'diferenciarme'],
    priority: 6,
    confidence: 0.6
  },

  // Branding and identity
  {
    category: IntentCategory.BRANDING,
    keywords: ['marca', 'branding', 'imagen', 'identidad', 'logo'],
    phrases: ['construir marca', 'imagen marca', 'posicionamiento marca', 'branding personal'],
    priority: 6,
    confidence: 0.6
  },

  // E-commerce and online sales
  {
    category: IntentCategory.ECOMMERCE,
    keywords: ['tienda online', 'ecommerce', 'sitio web', 'venta online'],
    phrases: ['crear tienda online', 'vender por internet', 'plataforma ecommerce', 'envíos online'],
    priority: 6,
    confidence: 0.6
  },

  // Location and local business
  {
    category: IntentCategory.LOCATION_HELP,
    keywords: ['ubicación', 'local', 'dirección', 'cerca', 'zona'],
    phrases: ['dónde ubicarme', 'mejor zona', 'local comercial', 'tráfico peatonal'],
    priority: 5,
    confidence: 0.5
  }
];

// Intent detection result interface
export interface IntentResult {
  intent: string;
  confidence: number;
  keywords: string[];
  context?: string;
  responseTime?: number;
  tokensUsed?: number;
  provider?: string;
}
export class IntentDetector {
  private patterns: IntentPattern[];

  constructor() {
    this.patterns = INTENT_PATTERNS.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect intent from message using multiple strategies
   */
  async detectIntent(message: string): Promise<IntentResult> {
    const normalizedMessage = this.normalizeMessage(message);

    // Strategy 1: Pattern-based detection (fastest)
    const patternResult = this.detectByPatterns(normalizedMessage);
    if (patternResult.confidence >= 0.7) {
      return patternResult;
    }

    // Strategy 2: AI-powered detection (if available)
    try {
      const aiResult = await this.detectByAI(normalizedMessage);
      if (aiResult.confidence >= 0.6) {
        return aiResult;
      }
    } catch (error) {
      // AI detection failed, continue with fallback
    }

    // Strategy 3: Context-aware detection
    const contextResult = this.detectByContext(normalizedMessage);
    if (contextResult.confidence >= 0.5) {
      return contextResult;
    }

    // Fallback: Return pattern result even if low confidence
    return patternResult;
  }

  /**
   * Normalize message for better detection
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\sáéíóúüñ]/g, ' ') // Remove punctuation except accents
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Pattern-based intent detection
   */
  private detectByPatterns(message: string): IntentResult {
    const results: IntentResult[] = [];

    for (const pattern of this.patterns) {
      let score = 0;
      let matchedKeywords: string[] = [];
      let matchedPhrases: string[] = [];

      // Check keywords
      for (const keyword of pattern.keywords) {
        if (message.includes(keyword)) {
          score += 0.3;
          matchedKeywords.push(keyword);
        }
      }

      // Check phrases
      for (const phrase of pattern.phrases) {
        if (message.includes(phrase)) {
          score += 0.5;
          matchedPhrases.push(phrase);
        }
      }

      // Boost score for exact phrase matches
      if (matchedPhrases.length > 0) {
        score += 0.2;
      }

      // Apply pattern priority multiplier
      score *= (1 + pattern.priority * 0.1);

      if (score >= 0.3) { // Minimum threshold
        results.push({
          intent: pattern.category,
          confidence: Math.min(score, pattern.confidence),
          keywords: matchedKeywords,
          context: `Detected by pattern: ${pattern.category}`,
          responseTime: 0
        });
      }
    }

    // Return best match
    if (results.length > 0) {
      return results.sort((a, b) => b.confidence - a.confidence)[0];
    }

    // Default fallback
    return {
      intent: IntentCategory.OTHER,
      confidence: 0.3,
      keywords: [],
      context: 'No clear intent detected',
      responseTime: 0
    };
  }

  /**
   * AI-powered intent detection (when available)
   */
  private async detectByAI(message: string): Promise<IntentResult> {
    // This would integrate with the AI provider's intent detection
    // For now, return a basic result
    return {
      intent: IntentCategory.OTHER,
      confidence: 0.5,
      keywords: [],
      context: 'AI detection not available',
      responseTime: 0
    };
  }

  /**
   * Context-aware intent detection
   */
  private detectByContext(message: string): IntentResult {
    // Simple context-based detection for common scenarios
    if (message.length < 10 && !message.includes(' ')) {
      return {
        intent: IntentCategory.OTHER,
        confidence: 0.2,
        keywords: [],
        context: 'Very short message',
        responseTime: 0
      };
    }

    // Check for question patterns
    if (message.includes('?') || message.includes('cómo') || message.includes('qué')) {
      // Questions are likely help requests
      return {
        intent: IntentCategory.MARKETING_HELP,
        confidence: 0.6,
        keywords: ['ayuda', 'cómo', 'qué'],
        context: 'Question detected',
        responseTime: 0
      };
    }

    return {
      intent: IntentCategory.OTHER,
      confidence: 0.3,
      keywords: [],
      context: 'Context analysis',
      responseTime: 0
    };
  }

  /**
   * Get all possible intents for a message (for debugging)
   */
  getAllPossibleIntents(message: string): IntentResult[] {
    const normalizedMessage = this.normalizeMessage(message);
    const results: IntentResult[] = [];

    for (const pattern of this.patterns) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword)) {
          score += 0.3;
          matchedKeywords.push(keyword);
        }
      }

      for (const phrase of pattern.phrases) {
        if (normalizedMessage.includes(phrase)) {
          score += 0.5;
        }
      }

      if (score > 0) {
        results.push({
          intent: pattern.category,
          confidence: Math.min(score, pattern.confidence),
          keywords: matchedKeywords,
          context: `Pattern match: ${pattern.category}`,
          responseTime: 0
        });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

