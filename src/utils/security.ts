import { Alert } from 'react-native';

/**
 * Security utilities for the TLDR app
 * Implements input validation, sanitization, and security best practices
 */
export class SecurityUtils {
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  /**
   * Validate and sanitize phone numbers
   */
  static validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(cleaned);
  }

  /**
   * Validate API keys (basic format check)
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || apiKey.length < 10) return false;
    
    const invalidPatterns = [
      /^test/i,
      /^demo/i,
      /^example/i,
      /^placeholder/i,
      /^your.*key/i,
      /^api.*key/i
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(apiKey));
  }

  /**
   * Validate webhook URLs
   */
  static validateWebhookUrl(url: string): boolean {
    if (!url) return true; // Optional field
    
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .trim();
  }

  /**
   * Validate configuration name
   */
  static validateConfigName(name: string): boolean {
    if (!name || name.length < 1 || name.length > 50) return false;
    
    const dangerousChars = /[<>\"'&]/;
    return !dangerousChars.test(name);
  }

  /**
   * Rate limiting utility
   */
  static checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);
    
    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }

  /**
   * Secure error handling - don't expose sensitive information
   */
  static handleError(error: unknown, context: string): string {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof Error) {
      const safeMessages = [
        'Network error',
        'Invalid configuration',
        'Connection failed',
        'Service unavailable'
      ];
      
      if (safeMessages.some(msg => error.message.includes(msg))) {
        return error.message;
      }
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Validate sync interval (prevent abuse)
   */
  static validateSyncInterval(interval: number): boolean {
    return interval >= 1 && interval <= 1440; // 1 minute to 24 hours
  }

  /**
   * Secure logging - don't log sensitive data
   */
  static secureLog(message: string, data?: any): void {
    const sanitizedData = data ? JSON.stringify(data, (key, value) => {
      const sensitiveKeys = ['apiKey', 'password', 'token', 'secret'];
      if (sensitiveKeys.includes(key)) {
        return '[REDACTED]';
      }
      return value;
    }) : undefined;
    
    console.log(`[SECURE] ${message}`, sanitizedData);
  }
}

/**
 * Input validation for WhatsApp configurations
 */
export const validateWhatsAppConfig = (config: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!SecurityUtils.validateConfigName(config.name)) {
    errors.push('Invalid configuration name');
  }
  
  if (!SecurityUtils.validatePhoneNumber(config.phoneNumber)) {
    errors.push('Invalid phone number format');
  }
  
  if (config.apiKey && !SecurityUtils.validateApiKey(config.apiKey)) {
    errors.push('Invalid API key format');
  }
  
  if (config.webhookUrl && !SecurityUtils.validateWebhookUrl(config.webhookUrl)) {
    errors.push('Invalid webhook URL');
  }
  
  if (!SecurityUtils.validateSyncInterval(config.syncInterval)) {
    errors.push('Sync interval must be between 1 and 1440 minutes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 