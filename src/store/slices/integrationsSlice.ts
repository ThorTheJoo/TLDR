import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  IntegrationsState, 
  IntegrationConfig, 
  IntegrationStatus,
  SyncStatus,
  SyncResult,
  IntegrationEvent
} from '../../types/integrations';
import { IntegrationService } from '../../services/integrationService';

const initialState: IntegrationsState = {
  configs: [],
  activeConfigs: [],
  loading: false,
  error: null,
  lastSync: {},
  syncStatus: {}
};

// Async thunks
export const fetchIntegrations = createAsyncThunk(
  'integrations/fetchIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await IntegrationService.getIntegrations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch integrations');
    }
  }
);

export const createIntegration = createAsyncThunk(
  'integrations/createIntegration',
  async (config: Partial<IntegrationConfig>, { rejectWithValue }) => {
    try {
      const response = await IntegrationService.createIntegration(config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create integration');
    }
  }
);

export const updateIntegration = createAsyncThunk(
  'integrations/updateIntegration',
  async ({ id, config }: { id: string; config: Partial<IntegrationConfig> }, { rejectWithValue }) => {
    try {
      const response = await IntegrationService.updateIntegration(id, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update integration');
    }
  }
);

export const deleteIntegration = createAsyncThunk(
  'integrations/deleteIntegration',
  async (id: string, { rejectWithValue }) => {
    try {
      await IntegrationService.deleteIntegration(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete integration');
    }
  }
);

export const testIntegration = createAsyncThunk(
  'integrations/testIntegration',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await IntegrationService.testConnection(id);
      return { id, success: response.success };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to test integration');
    }
  }
);

export const syncIntegration = createAsyncThunk(
  'integrations/syncIntegration',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await IntegrationService.syncIntegration(id);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync integration');
    }
  }
);

export const syncAllIntegrations = createAsyncThunk(
  'integrations/syncAllIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await IntegrationService.syncAllIntegrations();
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sync all integrations');
    }
  }
);

const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveConfigs: (state, action: PayloadAction<string[]>) => {
      state.activeConfigs = action.payload;
    },
    toggleActiveConfig: (state, action: PayloadAction<string>) => {
      const configId = action.payload;
      const index = state.activeConfigs.indexOf(configId);
      if (index > -1) {
        state.activeConfigs.splice(index, 1);
      } else {
        state.activeConfigs.push(configId);
      }
    },
    updateSyncStatus: (state, action: PayloadAction<{ id: string; status: SyncStatus }>) => {
      const { id, status } = action.payload;
      state.syncStatus[id] = status;
    },
    updateLastSync: (state, action: PayloadAction<{ id: string; timestamp: Date }>) => {
      const { id, timestamp } = action.payload;
      state.lastSync[id] = timestamp;
    },
    addIntegrationEvent: (state, action: PayloadAction<IntegrationEvent>) => {
      const event = action.payload;
      console.log('Integration event:', event);
    },
    updateIntegrationStatus: (state, action: PayloadAction<{ id: string; status: IntegrationStatus }>) => {
      const { id, status } = action.payload;
      const config = state.configs.find(c => c.id === id);
      if (config) {
        config.status = status;
        config.updatedAt = new Date();
      }
    },
    updateIntegrationMetadata: (state, action: PayloadAction<{ id: string; metadata: any }>) => {
      const { id, metadata } = action.payload;
      const config = state.configs.find(c => c.id === id);
      if (config) {
        config.metadata = { ...config.metadata, ...metadata };
        config.updatedAt = new Date();
      }
    }
  },
  extraReducers: (builder) => {
    // Helper function to handle common async state updates
    const handleAsyncState = (builder: any, asyncThunk: any, stateKey: keyof IntegrationsState) => {
      builder
        .addCase(asyncThunk.pending, (state: IntegrationsState) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(asyncThunk.fulfilled, (state: IntegrationsState, action: any) => {
          state.loading = false;
          if (stateKey === 'configs') {
            state.configs = action.payload;
          }
        })
        .addCase(asyncThunk.rejected, (state: IntegrationsState, action: any) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    };

    // Fetch integrations
    handleAsyncState(builder, fetchIntegrations, 'configs');

    // Create integration
    builder
      .addCase(createIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIntegration.fulfilled, (state, action) => {
        state.loading = false;
        state.configs.push(action.payload);
      })
      .addCase(createIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update integration
    builder
      .addCase(updateIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIntegration.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.configs.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.configs[index] = action.payload;
        }
      })
      .addCase(updateIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete integration
    builder
      .addCase(deleteIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIntegration.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.configs = state.configs.filter(c => c.id !== deletedId);
        state.activeConfigs = state.activeConfigs.filter(id => id !== deletedId);
        delete state.syncStatus[deletedId];
        delete state.lastSync[deletedId];
      })
      .addCase(deleteIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Test integration
    builder
      .addCase(testIntegration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testIntegration.fulfilled, (state, action) => {
        state.loading = false;
        const { id, success } = action.payload;
        const config = state.configs.find(c => c.id === id);
        if (config) {
          config.status = success ? 'active' : 'error';
          config.updatedAt = new Date();
        }
      })
      .addCase(testIntegration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync integration
    builder
      .addCase(syncIntegration.pending, (state, action) => {
        const id = action.meta.arg;
        state.syncStatus[id] = {
          status: 'syncing',
          lastSync: new Date(),
          itemsProcessed: 0
        };
      })
      .addCase(syncIntegration.fulfilled, (state, action) => {
        const result: SyncResult = action.payload;
        state.syncStatus[result.integrationId] = {
          status: result.status === 'success' ? 'success' : 'error',
          lastSync: new Date(),
          itemsProcessed: result.itemsProcessed,
          error: result.errors.length > 0 ? result.errors[0] : undefined
        };
        state.lastSync[result.integrationId] = new Date();
      })
      .addCase(syncIntegration.rejected, (state, action) => {
        const id = action.meta.arg;
        state.syncStatus[id] = {
          status: 'error',
          lastSync: new Date(),
          itemsProcessed: 0,
          error: action.payload as string
        };
      });

    // Sync all integrations
    builder
      .addCase(syncAllIntegrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncAllIntegrations.fulfilled, (state, action) => {
        state.loading = false;
        const results: SyncResult[] = action.payload;
        results.forEach(result => {
          state.syncStatus[result.integrationId] = {
            status: result.status === 'success' ? 'success' : 'error',
            lastSync: new Date(),
            itemsProcessed: result.itemsProcessed,
            error: result.errors.length > 0 ? result.errors[0] : undefined
          };
          state.lastSync[result.integrationId] = new Date();
        });
      })
      .addCase(syncAllIntegrations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setLoading,
  clearError,
  setActiveConfigs,
  toggleActiveConfig,
  updateSyncStatus,
  updateLastSync,
  addIntegrationEvent,
  updateIntegrationStatus,
  updateIntegrationMetadata
} = integrationsSlice.actions;

export default integrationsSlice.reducer; 