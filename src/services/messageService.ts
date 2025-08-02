import { WhatsAppMessage, PaginatedResponse, ApiResponse } from '../types';

class MessageService {
  private baseUrl = 'https://api.messages.com/v1'; // Mock API endpoint

  // Get messages with pagination and filtering
  async getMessages(params: {
    configId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    type?: string[];
    dateRange?: { start: Date; end: Date };
  }): Promise<PaginatedResponse<WhatsAppMessage>> {
    try {
      // Mock data - in real app, this would call actual API
      const mockMessages: WhatsAppMessage[] = [
        {
          id: '1',
          configId: '1',
          from: '+1234567890',
          to: '+1987654321',
          content: 'Hey! How are you doing today?',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          type: 'text',
          status: 'read',
        },
        {
          id: '2',
          configId: '1',
          from: '+1987654321',
          to: '+1234567890',
          content: 'I\'m doing great! Thanks for asking. How about you?',
          timestamp: new Date(Date.now() - 600000), // 10 minutes ago
          type: 'text',
          status: 'delivered',
        },
        {
          id: '3',
          configId: '2',
          from: '+1555123456',
          to: '+1234567890',
          content: 'Meeting reminder: Tomorrow at 2 PM',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          type: 'text',
          status: 'sent',
        },
        {
          id: '4',
          configId: '1',
          from: '+1234567890',
          to: '+1987654321',
          content: 'Can you send me the project files?',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          type: 'text',
          status: 'read',
        },
        {
          id: '5',
          configId: '2',
          from: '+1987654321',
          to: '+1234567890',
          content: 'Invoice #12345 is ready for review',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          type: 'text',
          status: 'delivered',
        },
      ];

      // Apply filters
      let filteredMessages = mockMessages;
      
      if (params.configId) {
        filteredMessages = filteredMessages.filter(msg => msg.configId === params.configId);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredMessages = filteredMessages.filter(msg => 
          msg.content.toLowerCase().includes(searchLower) ||
          msg.from.toLowerCase().includes(searchLower) ||
          msg.to.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.status && params.status.length > 0) {
        filteredMessages = filteredMessages.filter(msg => params.status!.includes(msg.status));
      }
      
      if (params.type && params.type.length > 0) {
        filteredMessages = filteredMessages.filter(msg => params.type!.includes(msg.type));
      }
      
      if (params.dateRange) {
        filteredMessages = filteredMessages.filter(msg => 
          msg.timestamp >= params.dateRange!.start && msg.timestamp <= params.dateRange!.end
        );
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

      return {
        data: paginatedMessages,
        total: filteredMessages.length,
        page,
        limit,
        hasMore: endIndex < filteredMessages.length,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch messages');
    }
  }

  // Send a new message
  async sendMessage(message: {
    configId: string;
    to: string;
    content: string;
    type?: string;
  }): Promise<ApiResponse<WhatsAppMessage>> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        configId: message.configId,
        from: '+1234567890', // Mock sender
        to: message.to,
        content: message.content,
        timestamp: new Date(),
        type: (message.type as any) || 'text',
        status: 'sent',
      };

      return {
        success: true,
        data: newMessage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete message',
      };
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<ApiResponse<WhatsAppMessage>> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock updated message
      const updatedMessage: WhatsAppMessage = {
        id: messageId,
        configId: '1',
        from: '+1987654321',
        to: '+1234567890',
        content: 'This message has been marked as read',
        timestamp: new Date(),
        type: 'text',
        status: 'read',
      };

      return {
        success: true,
        data: updatedMessage,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark message as read',
      };
    }
  }

  // Get message statistics
  async getMessageStats(configId?: string): Promise<ApiResponse<{
    total: number;
    unread: number;
    sent: number;
    received: number;
    today: number;
  }>> {
    try {
      // Mock statistics
      const stats = {
        total: 150,
        unread: 12,
        sent: 75,
        received: 75,
        today: 8,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch message statistics',
      };
    }
  }

  // Export messages
  async exportMessages(params: {
    configId?: string;
    format: 'json' | 'csv' | 'pdf';
    dateRange?: { start: Date; end: Date };
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        data: {
          downloadUrl: 'https://example.com/export/messages.json',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export messages',
      };
    }
  }
}

export const messageService = new MessageService(); 