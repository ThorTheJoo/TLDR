import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WhatsAppConfig, ApiResponse } from '../../types';
import { whatsappService } from '../../services/whatsappService';

interface WhatsAppState {
  configs: WhatsAppConfig[];
  activeConfig: WhatsAppConfig | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WhatsAppState = {
  configs: [],
  activeConfig: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWhatsAppConfigs = createAsyncThunk(
  'whatsapp/fetchConfigs',
  async () => {
    const response = await whatsappService.getConfigs();
    return response.data || [];
  }
);

export const createWhatsAppConfig = createAsyncThunk(
  'whatsapp/createConfig',
  async (config: Omit<WhatsAppConfig, 'id'>) => {
    const response = await whatsappService.createConfig(config);
    return response.data;
  }
);

export const updateWhatsAppConfig = createAsyncThunk(
  'whatsapp/updateConfig',
  async ({ id, config }: { id: string; config: Partial<WhatsAppConfig> }) => {
    const response = await whatsappService.updateConfig(id, config);
    return response.data;
  }
);

export const deleteWhatsAppConfig = createAsyncThunk(
  'whatsapp/deleteConfig',
  async (id: string) => {
    await whatsappService.deleteConfig(id);
    return id;
  }
);

export const testWhatsAppConnection = createAsyncThunk(
  'whatsapp/testConnection',
  async (configId: string) => {
    const response = await whatsappService.testConnection(configId);
    return response;
  }
);

const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState,
  reducers: {
    setActiveConfig: (state, action: PayloadAction<WhatsAppConfig | null>) => {
      state.activeConfig = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch configs
    builder
      .addCase(fetchWhatsAppConfigs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWhatsAppConfigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configs = action.payload;
      })
      .addCase(fetchWhatsAppConfigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch configs';
      });

    // Create config
    builder
      .addCase(createWhatsAppConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWhatsAppConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configs.push(action.payload);
      })
      .addCase(createWhatsAppConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create config';
      });

    // Update config
    builder
      .addCase(updateWhatsAppConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWhatsAppConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.configs.findIndex(config => config.id === action.payload.id);
        if (index !== -1) {
          state.configs[index] = action.payload;
        }
        if (state.activeConfig?.id === action.payload.id) {
          state.activeConfig = action.payload;
        }
      })
      .addCase(updateWhatsAppConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update config';
      });

    // Delete config
    builder
      .addCase(deleteWhatsAppConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWhatsAppConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configs = state.configs.filter(config => config.id !== action.payload);
        if (state.activeConfig?.id === action.payload) {
          state.activeConfig = null;
        }
      })
      .addCase(deleteWhatsAppConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete config';
      });

    // Test connection
    builder
      .addCase(testWhatsAppConnection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testWhatsAppConnection.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(testWhatsAppConnection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Connection test failed';
      });
  },
});

export const { setActiveConfig, clearError, setLoading } = whatsappSlice.actions;
export default whatsappSlice.reducer; 