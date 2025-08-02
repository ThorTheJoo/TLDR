import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WhatsAppMessage, PaginatedResponse } from '../../types';
import { messageService } from '../../services/messageService';

interface MessagesState {
  messages: WhatsAppMessage[];
  filteredMessages: WhatsAppMessage[];
  selectedMessage: WhatsAppMessage | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    configId?: string;
    search?: string;
    dateRange?: { start: Date; end: Date };
    status?: string[];
    type?: string[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: MessagesState = {
  messages: [],
  filteredMessages: [],
  selectedMessage: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ configId, page = 1, limit = 20 }: { configId?: string; page?: number; limit?: number }) => {
    const response = await messageService.getMessages({ configId, page, limit });
    return response;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (message: { configId: string; to: string; content: string; type?: string }) => {
    const response = await messageService.sendMessage(message);
    return response.data;
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId: string) => {
    await messageService.deleteMessage(messageId);
    return messageId;
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId: string) => {
    const response = await messageService.markAsRead(messageId);
    return response.data;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setSelectedMessage: (state, action: PayloadAction<WhatsAppMessage | null>) => {
      state.selectedMessage = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<MessagesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    addMessage: (state, action: PayloadAction<WhatsAppMessage>) => {
      state.messages.unshift(action.payload);
      state.filteredMessages.unshift(action.payload);
    },
    updateMessage: (state, action: PayloadAction<WhatsAppMessage>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
      const filteredIndex = state.filteredMessages.findIndex(msg => msg.id === action.payload.id);
      if (filteredIndex !== -1) {
        state.filteredMessages[filteredIndex] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPagination: (state) => {
      state.pagination.page = 1;
      state.pagination.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page, total, hasMore } = action.payload;
        
        if (page === 1) {
          state.messages = data;
          state.filteredMessages = data;
        } else {
          state.messages.push(...data);
          state.filteredMessages.push(...data);
        }
        
        state.pagination = {
          page,
          limit: state.pagination.limit,
          total,
          hasMore,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.unshift(action.payload);
        state.filteredMessages.unshift(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to send message';
      });

    // Delete message
    builder
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.messages.filter(msg => msg.id !== action.payload);
        state.filteredMessages = state.filteredMessages.filter(msg => msg.id !== action.payload);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete message';
      });

    // Mark as read
    builder
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex(msg => msg.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        const filteredIndex = state.filteredMessages.findIndex(msg => msg.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredMessages[filteredIndex] = action.payload;
        }
      });
  },
});

export const {
  setSelectedMessage,
  setFilters,
  clearFilters,
  addMessage,
  updateMessage,
  clearError,
  resetPagination,
} = messagesSlice.actions;

export default messagesSlice.reducer; 