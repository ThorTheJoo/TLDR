import { WhatsAppConfig, ApiResponse } from '../types';
import { secureStore } from '../utils/secureStore';
import { SecurityUtils, validateWhatsAppConfig } from '../utils/security';

class WhatsAppService {
  private baseUrl = 'https://api.whatsapp.com/v1'; // Mock API endpoint
  private apiKey: string | null = null;

  constructor() {
    this.initializeApiKey();
  }

  private async initializeApiKey() {
    try {
      this.apiKey = await secureStore.getItem('whatsapp_api_key');
    } catch (error) {
      SecurityUtils.secureLog('Failed to initialize API key', { error: SecurityUtils.handleError(error, 'API Key Init') });
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  // Configuration Management
  async getConfigs(): Promise<ApiResponse<WhatsAppConfig[]>> {
    try {
      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('getConfigs')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // For now, return mock data - in real app, this would call actual API
      const mockConfigs: WhatsAppConfig[] = [
        {
          id: '1',
          name: 'Personal WhatsApp',
          phoneNumber: '+1234567890',
          isActive: true,
          syncInterval: 5,
          autoReply: false,
          lastSync: new Date(),
        },
        {
          id: '2',
          name: 'Business WhatsApp',
          phoneNumber: '+1987654321',
          isActive: false,
          syncInterval: 10,
          autoReply: true,
          autoReplyMessage: 'Thanks for your message. I\'ll get back to you soon.',
          lastSync: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ];

      SecurityUtils.secureLog('Configs fetched successfully', { count: mockConfigs.length });

      return {
        success: true,
        data: mockConfigs,
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'getConfigs');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async createConfig(config: Omit<WhatsAppConfig, 'id'>): Promise<ApiResponse<WhatsAppConfig>> {
    try {
      // Validate input
      const validation = validateWhatsAppConfig(config);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('createConfig')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Sanitize inputs
      const sanitizedConfig = {
        ...config,
        name: SecurityUtils.sanitizeInput(config.name),
        phoneNumber: config.phoneNumber.replace(/[^\d+]/g, ''),
        autoReplyMessage: config.autoReplyMessage ? SecurityUtils.sanitizeInput(config.autoReplyMessage) : undefined,
      };

      const newConfig: WhatsAppConfig = {
        ...sanitizedConfig,
        id: Date.now().toString(),
        lastSync: new Date(),
      };

      SecurityUtils.secureLog('Config created successfully', { configId: newConfig.id, name: newConfig.name });

      return {
        success: true,
        data: newConfig,
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'createConfig');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateConfig(id: string, config: Partial<WhatsAppConfig>): Promise<ApiResponse<WhatsAppConfig>> {
    try {
      // Validate ID
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid configuration ID');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('updateConfig')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Validate partial config
      if (config.name && !SecurityUtils.validateConfigName(config.name)) {
        throw new Error('Invalid configuration name');
      }

      if (config.phoneNumber && !SecurityUtils.validatePhoneNumber(config.phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      if (config.syncInterval && !SecurityUtils.validateSyncInterval(config.syncInterval)) {
        throw new Error('Invalid sync interval');
      }

      // In real app, this would update via API
      const updatedConfig: WhatsAppConfig = {
        id,
        name: config.name || 'Updated Config',
        phoneNumber: config.phoneNumber || '+1234567890',
        isActive: config.isActive ?? true,
        syncInterval: config.syncInterval || 5,
        autoReply: config.autoReply ?? false,
        autoReplyMessage: config.autoReplyMessage ? SecurityUtils.sanitizeInput(config.autoReplyMessage) : undefined,
        lastSync: new Date(),
      };

      SecurityUtils.secureLog('Config updated successfully', { configId: id });

      return {
        success: true,
        data: updatedConfig,
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'updateConfig');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteConfig(id: string): Promise<ApiResponse<void>> {
    try {
      // Validate ID
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid configuration ID');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('deleteConfig')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // In real app, this would delete via API
      SecurityUtils.secureLog('Config deleted successfully', { configId: id });

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'deleteConfig');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Connection Testing
  async testConnection(configId: string): Promise<ApiResponse<{ connected: boolean; message: string }>> {
    try {
      // Validate ID
      if (!configId || typeof configId !== 'string') {
        throw new Error('Invalid configuration ID');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('testConnection')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isConnected = Math.random() > 0.3; // 70% success rate for demo
      
      SecurityUtils.secureLog('Connection test completed', { configId, connected: isConnected });

      return {
        success: true,
        data: {
          connected: isConnected,
          message: isConnected 
            ? 'Connection successful! WhatsApp integration is working properly.'
            : 'Connection failed. Please check your configuration and try again.',
        },
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'testConnection');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Message Operations
  async sendMessage(message: {
    configId: string;
    to: string;
    content: string;
    type?: string;
  }): Promise<ApiResponse<any>> {
    try {
      // Validate inputs
      if (!message.configId || !message.to || !message.content) {
        throw new Error('Missing required message fields');
      }

      if (!SecurityUtils.validatePhoneNumber(message.to)) {
        throw new Error('Invalid recipient phone number');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('sendMessage')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Sanitize content
      const sanitizedContent = SecurityUtils.sanitizeInput(message.content);
      if (sanitizedContent.length > 1000) {
        throw new Error('Message content too long');
      }

      // Simulate message sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      SecurityUtils.secureLog('Message sent successfully', { 
        configId: message.configId, 
        to: message.to,
        contentLength: sanitizedContent.length 
      });

      return {
        success: true,
        data: {
          id: Date.now().toString(),
          status: 'sent',
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'sendMessage');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Webhook Management
  async setupWebhook(configId: string, webhookUrl: string): Promise<ApiResponse<void>> {
    try {
      // Validate inputs
      if (!configId || !webhookUrl) {
        throw new Error('Missing required webhook parameters');
      }

      if (!SecurityUtils.validateWebhookUrl(webhookUrl)) {
        throw new Error('Invalid webhook URL');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('setupWebhook')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // In real app, this would configure webhook with WhatsApp API
      SecurityUtils.secureLog('Webhook setup completed', { configId });

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'setupWebhook');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Sync Operations
  async syncMessages(configId: string): Promise<ApiResponse<{ synced: number }>> {
    try {
      // Validate ID
      if (!configId || typeof configId !== 'string') {
        throw new Error('Invalid configuration ID');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('syncMessages')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const syncedCount = Math.floor(Math.random() * 50) + 1; // 1-50 messages
      
      SecurityUtils.secureLog('Messages synced successfully', { configId, syncedCount });

      return {
        success: true,
        data: {
          synced: syncedCount,
        },
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'syncMessages');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // QR Code Generation (for WhatsApp Web integration)
  async generateQRCode(configId: string): Promise<ApiResponse<{ qrCode: string; expiresAt: Date }>> {
    try {
      // Validate ID
      if (!configId || typeof configId !== 'string') {
        throw new Error('Invalid configuration ID');
      }

      // Rate limiting check
      if (!SecurityUtils.checkRateLimit('generateQRCode')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // In real app, this would generate QR code for WhatsApp Web
      const mockQRCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      SecurityUtils.secureLog('QR code generated successfully', { configId });

      return {
        success: true,
        data: {
          qrCode: mockQRCode,
          expiresAt: new Date(Date.now() + 60000), // 1 minute from now
        },
      };
    } catch (error) {
      const errorMessage = SecurityUtils.handleError(error, 'generateQRCode');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const whatsappService = new WhatsAppService(); 