import { 
  IntegrationConfig, 
  IntegrationApiResponse, 
  SyncResult,
  EmailMessage,
  EmailFilter
} from '../types/integrations';
import { SecurityUtils } from '../utils/security';

class IntegrationService {
  private baseUrl = 'https://api.tldr.app/integrations';
  private secureStore: any;

  constructor() {
    this.secureStore = require('../utils/secureStore').SecureStorage;
  }

  // Generic Integration Methods
  async getIntegrations(): Promise<IntegrationApiResponse<IntegrationConfig[]>> {
    try {
      SecurityUtils.secureLog('Fetching integrations');
      return {
        success: true,
        data: this.getMockIntegrations(),
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to fetch integrations', error);
    }
  }

  async createIntegration(config: Partial<IntegrationConfig>): Promise<IntegrationApiResponse<IntegrationConfig>> {
    try {
      SecurityUtils.secureLog('Creating integration', { type: config.type, provider: config.provider });
      
      this.validateRequiredFields(config);
      const newIntegration = this.createMockIntegration(config);

      return {
        success: true,
        data: newIntegration,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to create integration', error);
    }
  }

  async updateIntegration(id: string, config: Partial<IntegrationConfig>): Promise<IntegrationApiResponse<IntegrationConfig>> {
    try {
      SecurityUtils.secureLog('Updating integration', { id });
      
      const updatedIntegration = this.createMockIntegration({ ...config, id });

      return {
        success: true,
        data: updatedIntegration,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to update integration', error);
    }
  }

  async deleteIntegration(id: string): Promise<IntegrationApiResponse<void>> {
    try {
      SecurityUtils.secureLog('Deleting integration', { id });
      
      return {
        success: true,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to delete integration', error);
    }
  }

  async testConnection(id: string): Promise<IntegrationApiResponse<boolean>> {
    try {
      SecurityUtils.secureLog('Testing integration connection', { id });
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      return {
        success: true,
        data: success,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to test connection', error);
    }
  }

  async syncIntegration(id: string): Promise<SyncResult> {
    try {
      SecurityUtils.secureLog('Syncing integration', { id });
      
      return this.generateMockSyncResult(id);
    } catch (error) {
      return {
        integrationId: id,
        status: 'error',
        itemsProcessed: 0,
        itemsFailed: 1,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
        duration: 0
      };
    }
  }

  async syncAllIntegrations(): Promise<SyncResult[]> {
    try {
      SecurityUtils.secureLog('Syncing all integrations');
      
      const integrations = await this.getIntegrations();
      const results: SyncResult[] = [];
      
      for (const integration of integrations.data || []) {
        const result = await this.syncIntegration(integration.id);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      SecurityUtils.secureLog('Failed to sync all integrations', error);
      return [];
    }
  }

  // Gmail Specific Methods
  async getGmailMessages(integrationId: string, filter?: EmailFilter): Promise<IntegrationApiResponse<EmailMessage[]>> {
    try {
      SecurityUtils.secureLog('Fetching Gmail messages', { integrationId });
      
      const mockMessages = this.getMockGmailMessages(integrationId);
      const filteredMessages = filter ? this.applyEmailFilters(mockMessages, filter) : mockMessages;

      return {
        success: true,
        data: filteredMessages,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to fetch Gmail messages', error);
    }
  }

  async sendGmailMessage(integrationId: string, message: Partial<EmailMessage>): Promise<IntegrationApiResponse<EmailMessage>> {
    try {
      SecurityUtils.secureLog('Sending Gmail message', { integrationId });
      
      this.validateMessageFields(message);
      const sentMessage = this.createMockSentMessage(message, integrationId);

      return {
        success: true,
        data: sentMessage,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to send Gmail message', error);
    }
  }

  async getGmailLabels(integrationId: string): Promise<IntegrationApiResponse<any[]>> {
    try {
      SecurityUtils.secureLog('Fetching Gmail labels', { integrationId });
      
      return {
        success: true,
        data: this.getMockGmailLabels(),
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to fetch Gmail labels', error);
    }
  }

  // OAuth Methods
  async initiateOAuth(provider: string, redirectUri: string): Promise<IntegrationApiResponse<string>> {
    try {
      SecurityUtils.secureLog('Initiating OAuth', { provider });
      
      const oauthUrl = `https://accounts.google.com/oauth/authorize?client_id=mock-client-id&redirect_uri=${encodeURIComponent(redirectUri)}&scope=gmail.readonly&response_type=code`;
      
      return {
        success: true,
        data: oauthUrl,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to initiate OAuth', error);
    }
  }

  async completeOAuth(provider: string, code: string): Promise<IntegrationApiResponse<any>> {
    try {
      SecurityUtils.secureLog('Completing OAuth', { provider });
      
      const tokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600
      };
      
      return {
        success: true,
        data: tokens,
        timestamp: new Date()
      };
    } catch (error) {
      return SecurityUtils.handleError('Failed to complete OAuth', error);
    }
  }

  // Private helper methods
  private validateRequiredFields(config: Partial<IntegrationConfig>): void {
    if (!config.name || !config.type || !config.provider) {
      throw new Error('Missing required fields: name, type, provider');
    }
  }

  private validateMessageFields(message: Partial<EmailMessage>): void {
    if (!message.to || !message.subject || !message.body) {
      throw new Error('Missing required fields: to, subject, body');
    }
  }

  private getMockIntegrations(): IntegrationConfig[] {
    return [
      {
        id: 'gmail-1',
        name: 'Personal Gmail',
        type: 'email',
        provider: 'gmail',
        status: 'active',
        credentials: {
          accessToken: '***hidden***',
          refreshToken: '***hidden***',
          clientId: '***hidden***',
          clientSecret: '***hidden***'
        },
        settings: {
          autoSync: true,
          notifications: true,
          syncInterval: 15,
          maxRetries: 3,
          timeout: 30
        },
        metadata: {
          description: 'Personal Gmail account for email management',
          version: '1.0.0',
          capabilities: ['read_emails', 'send_emails', 'manage_labels'],
          errorCount: 0,
          messageCount: 1247
        },
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date('2024-12-15')
      }
    ];
  }

  private createMockIntegration(config: Partial<IntegrationConfig>): IntegrationConfig {
    return {
      id: config.id || `integration-${Date.now()}`,
      name: config.name || 'New Integration',
      type: config.type || 'email',
      provider: config.provider || 'gmail',
      status: config.status || 'pending',
      credentials: config.credentials || {},
      settings: {
        autoSync: true,
        notifications: true,
        syncInterval: 15,
        maxRetries: 3,
        timeout: 30,
        ...config.settings
      },
      metadata: {
        version: '1.0.0',
        capabilities: [],
        errorCount: 0,
        messageCount: 0,
        ...config.metadata
      },
      createdAt: config.createdAt || new Date('2024-12-15'),
      updatedAt: new Date()
    };
  }

  private generateMockSyncResult(id: string): SyncResult {
    const itemsProcessed = Math.floor(Math.random() * 100) + 10;
    const itemsFailed = Math.floor(Math.random() * 5);
    const status = itemsFailed === 0 ? 'success' : 'partial';
    
    return {
      integrationId: id,
      status,
      itemsProcessed,
      itemsFailed,
      errors: itemsFailed > 0 ? ['Some items failed to sync'] : [],
      duration: Math.floor(Math.random() * 5000) + 1000
    };
  }

  private getMockGmailMessages(integrationId: string): EmailMessage[] {
    return [
      {
        id: 'msg-1',
        threadId: 'thread-1',
        subject: 'Project Update - Q4 Goals',
        from: { name: 'John Smith', email: 'john.smith@company.com' },
        to: [{ name: 'You', email: 'user@gmail.com' }],
        body: {
          plainText: 'Hi, here is the Q4 project update...',
          html: '<p>Hi, here is the Q4 project update...</p>',
          textFormat: 'both'
        },
        labels: ['INBOX', 'IMPORTANT'],
        isRead: false,
        isStarred: true,
        isImportant: true,
        date: new Date('2024-12-15T10:30:00Z'),
        snippet: 'Hi, here is the Q4 project update...',
        integrationId
      },
      {
        id: 'msg-2',
        threadId: 'thread-2',
        subject: 'Meeting Reminder - Tomorrow 2 PM',
        from: { name: 'Calendar', email: 'calendar@gmail.com' },
        to: [{ name: 'You', email: 'user@gmail.com' }],
        body: {
          plainText: 'Reminder: Team meeting tomorrow at 2 PM...',
          html: '<p>Reminder: Team meeting tomorrow at 2 PM...</p>',
          textFormat: 'both'
        },
        labels: ['INBOX'],
        isRead: true,
        isStarred: false,
        isImportant: false,
        date: new Date('2024-12-15T09:15:00Z'),
        snippet: 'Reminder: Team meeting tomorrow at 2 PM...',
        integrationId
      },
      {
        id: 'msg-3',
        threadId: 'thread-3',
        subject: 'Invoice #12345 - Payment Due',
        from: { name: 'Billing System', email: 'billing@service.com' },
        to: [{ name: 'You', email: 'user@gmail.com' }],
        body: {
          plainText: 'Your invoice #12345 is ready for payment...',
          html: '<p>Your invoice #12345 is ready for payment...</p>',
          textFormat: 'both'
        },
        labels: ['INBOX', 'BILLING'],
        isRead: false,
        isStarred: false,
        isImportant: true,
        date: new Date('2024-12-15T08:45:00Z'),
        snippet: 'Your invoice #12345 is ready for payment...',
        integrationId
      }
    ];
  }

  private createMockSentMessage(message: Partial<EmailMessage>, integrationId: string): EmailMessage {
    return {
      id: `sent-${Date.now()}`,
      threadId: `thread-${Date.now()}`,
      subject: message.subject || '',
      from: { name: 'You', email: 'user@gmail.com' },
      to: message.to!,
      cc: message.cc,
      bcc: message.bcc,
      body: message.body!,
      attachments: message.attachments,
      labels: ['SENT'],
      isRead: true,
      isStarred: false,
      isImportant: false,
      date: new Date(),
      snippet: message.body!.plainText || '',
      integrationId
    };
  }

  private getMockGmailLabels(): any[] {
    return [
      { id: 'INBOX', name: 'INBOX', type: 'system', messagesTotal: 1247, messagesUnread: 23 },
      { id: 'SENT', name: 'SENT', type: 'system', messagesTotal: 456, messagesUnread: 0 },
      { id: 'DRAFT', name: 'DRAFT', type: 'system', messagesTotal: 12, messagesUnread: 0 },
      { id: 'SPAM', name: 'SPAM', type: 'system', messagesTotal: 89, messagesUnread: 0 },
      { id: 'TRASH', name: 'TRASH', type: 'system', messagesTotal: 234, messagesUnread: 0 },
      { id: 'IMPORTANT', name: 'IMPORTANT', type: 'user', messagesTotal: 45, messagesUnread: 5 },
      { id: 'WORK', name: 'WORK', type: 'user', messagesTotal: 123, messagesUnread: 8 },
      { id: 'PERSONAL', name: 'PERSONAL', type: 'user', messagesTotal: 67, messagesUnread: 3 }
    ];
  }

  private applyEmailFilters(messages: EmailMessage[], filter: EmailFilter): EmailMessage[] {
    return messages.filter(message => {
      if (filter.from && !message.from.email.toLowerCase().includes(filter.from.toLowerCase())) {
        return false;
      }
      if (filter.to && !message.to.some(addr => addr.email.toLowerCase().includes(filter.to!.toLowerCase()))) {
        return false;
      }
      if (filter.subject && !message.subject.toLowerCase().includes(filter.subject.toLowerCase())) {
        return false;
      }
      if (filter.hasAttachments !== undefined && !!message.attachments?.length !== filter.hasAttachments) {
        return false;
      }
      if (filter.isRead !== undefined && message.isRead !== filter.isRead) {
        return false;
      }
      if (filter.isStarred !== undefined && message.isStarred !== filter.isStarred) {
        return false;
      }
      if (filter.labels && filter.labels.length > 0) {
        const hasMatchingLabel = filter.labels.some(label => message.labels.includes(label));
        if (!hasMatchingLabel) {
          return false;
        }
      }
      if (filter.dateRange) {
        const messageDate = new Date(message.date);
        if (messageDate < filter.dateRange.start || messageDate > filter.dateRange.end) {
          return false;
        }
      }
      return true;
    });
  }
}

export const IntegrationService = new IntegrationService(); 