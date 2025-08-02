import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Switch,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  fetchIntegrations,
  createIntegration,
  deleteIntegration,
  testIntegration,
  syncIntegration,
  toggleActiveConfig,
  clearError
} from '../store/slices/integrationsSlice';
import { IntegrationConfig, IntegrationType, IntegrationStatus } from '../types/integrations';
import { INTEGRATION_PROVIDERS, getProviderById } from '../config/integrationProviders';

/**
 * IntegrationsScreen Component
 * 
 * Main screen for managing cloud app integrations (Gmail, Slack, Calendar, etc.)
 * Features:
 * - View all configured integrations
 * - Add new integrations with provider selection
 * - Test connection status
 * - Sync individual or all integrations
 * - Delete integrations
 * - Filter by type and status
 * 
 * Architecture Principles:
 * - AI-Native: Intelligent integration suggestions
 * - Privacy-First: Secure credential handling
 * - Human-Centered: Clear status indicators and actions
 * - Modular: Reusable components for different providers
 */
const IntegrationsScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  // Redux state selectors with type safety
  const {
    configs,
    activeConfigs,
    loading,
    error,
    syncStatus
  } = useSelector((state: RootState) => state.integrations);

  // Local state for UI interactions
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [filterType, setFilterType] = useState<IntegrationType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Initialize integrations on component mount
   * Fetches existing integrations and handles any errors
   */
  useEffect(() => {
    console.log('🔄 IntegrationsScreen: Initializing, fetching integrations...');
    dispatch(fetchIntegrations() as any);
  }, [dispatch]);

  /**
   * Handle errors with user-friendly messages
   * Automatically clears errors after display
   */
  useEffect(() => {
    if (error) {
      console.error('❌ IntegrationsScreen: Error occurred:', error);
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  /**
   * Pull-to-refresh handler
   * Provides manual refresh capability for users
   */
  const handleRefresh = useCallback(async () => {
    console.log('🔄 IntegrationsScreen: Manual refresh triggered');
    setRefreshing(true);
    try {
      await dispatch(fetchIntegrations() as any);
    } catch (err) {
      console.error('❌ IntegrationsScreen: Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  /**
   * Add new integration handler
   * Creates integration with validation and error handling
   */
  const handleAddIntegration = useCallback(async (integrationData: {
    name: string;
    provider: string;
    credentials: any;
  }) => {
    console.log('➕ IntegrationsScreen: Adding integration:', integrationData.provider);
    
    try {
      // Validate required fields
      if (!integrationData.name || !integrationData.provider) {
        throw new Error('Name and provider are required');
      }

      const provider = getProviderById(integrationData.provider);
      if (!provider) {
        throw new Error('Invalid provider selected');
      }

      // Create integration config
      const newConfig: Partial<IntegrationConfig> = {
        name: integrationData.name,
        type: provider.type,
        provider: integrationData.provider,
        credentials: integrationData.credentials,
        settings: {
          autoSync: true,
          notifications: true,
          syncInterval: 15,
          maxRetries: 3,
          timeout: 30
        },
        metadata: {
          version: '1.0.0',
          capabilities: provider.capabilities,
          errorCount: 0,
          messageCount: 0
        }
      };

      await dispatch(createIntegration(newConfig) as any);
      setShowAddModal(false);
      setSelectedProvider('');
      
      console.log('✅ IntegrationsScreen: Integration added successfully');
      Alert.alert('Success', 'Integration added successfully!');
      
    } catch (err) {
      console.error('❌ IntegrationsScreen: Failed to add integration:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add integration');
    }
  }, [dispatch]);

  /**
   * Test integration connection
   * Validates credentials and connectivity
   */
  const handleTestConnection = useCallback(async (integrationId: string) => {
    console.log('🔍 IntegrationsScreen: Testing connection for:', integrationId);
    
    try {
      const result = await dispatch(testIntegration(integrationId) as any);
      const success = result.payload?.success;
      
      Alert.alert(
        'Connection Test',
        success ? 'Connection successful!' : 'Connection failed. Please check your credentials.',
        [{ text: 'OK' }]
      );
      
      console.log(`${success ? '✅' : '❌'} IntegrationsScreen: Connection test result:`, success);
    } catch (err) {
      console.error('❌ IntegrationsScreen: Connection test failed:', err);
      Alert.alert('Error', 'Failed to test connection');
    }
  }, [dispatch]);

  /**
   * Sync integration data
   * Fetches latest data from the integration provider
   */
  const handleSyncIntegration = useCallback(async (integrationId: string) => {
    console.log('🔄 IntegrationsScreen: Syncing integration:', integrationId);
    
    try {
      await dispatch(syncIntegration(integrationId) as any);
      console.log('✅ IntegrationsScreen: Sync completed for:', integrationId);
    } catch (err) {
      console.error('❌ IntegrationsScreen: Sync failed for:', integrationId, err);
    }
  }, [dispatch]);

  /**
   * Delete integration with confirmation
   * Includes safety check to prevent accidental deletion
   */
  const handleDeleteIntegration = useCallback((integrationId: string, integrationName: string) => {
    console.log('🗑️ IntegrationsScreen: Delete requested for:', integrationId);
    
    Alert.alert(
      'Delete Integration',
      `Are you sure you want to delete "${integrationName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteIntegration(integrationId) as any);
              console.log('✅ IntegrationsScreen: Integration deleted:', integrationId);
              Alert.alert('Success', 'Integration deleted successfully');
            } catch (err) {
              console.error('❌ IntegrationsScreen: Delete failed:', err);
              Alert.alert('Error', 'Failed to delete integration');
            }
          }
        }
      ]
    );
  }, [dispatch]);

  /**
   * Toggle integration active status
   * Controls whether integration participates in sync operations
   */
  const handleToggleActive = useCallback((integrationId: string) => {
    console.log('🔄 IntegrationsScreen: Toggling active status for:', integrationId);
    dispatch(toggleActiveConfig(integrationId));
  }, [dispatch]);

  /**
   * Filter integrations based on search and type
   * Provides real-time filtering for better UX
   */
  const filteredIntegrations = React.useMemo(() => {
    console.log('🔍 IntegrationsScreen: Filtering integrations...');
    
    let filtered = configs;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(config => config.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(config =>
        config.name.toLowerCase().includes(query) ||
        config.provider.toLowerCase().includes(query) ||
        config.type.toLowerCase().includes(query)
      );
    }

    console.log(`🔍 IntegrationsScreen: Filtered ${filtered.length}/${configs.length} integrations`);
    return filtered;
  }, [configs, filterType, searchQuery]);

  /**
   * Get status color for visual indication
   * Provides consistent status styling across the app
   */
  const getStatusColor = useCallback((status: IntegrationStatus): string => {
    const colors = {
      active: '#10B981',    // Green
      inactive: '#6B7280',  // Gray
      error: '#EF4444',     // Red
      pending: '#F59E0B',   // Yellow
      disconnected: '#8B5CF6' // Purple
    };
    return colors[status] || colors.inactive;
  }, []);

  /**
   * Get sync status indicator
   * Shows real-time sync progress and results
   */
  const getSyncStatusIndicator = useCallback((integrationId: string) => {
    const status = syncStatus[integrationId];
    if (!status) return '⚪'; // No status

    const indicators = {
      idle: '⚪',
      syncing: '🔄',
      success: '✅',
      error: '❌'
    };

    return indicators[status.status] || '⚪';
  }, [syncStatus]);

  /**
   * Render individual integration item
   * Displays integration info with action buttons
   */
  const renderIntegrationItem = useCallback(({ item }: { item: IntegrationConfig }) => {
    const provider = getProviderById(item.provider);
    const isActive = activeConfigs.includes(item.id);
    const syncIndicator = getSyncStatusIndicator(item.id);

    return (
      <View style={styles.integrationCard} testID={`integration-${item.id}`}>
        {/* Header with provider info */}
        <View style={styles.cardHeader}>
          <View style={styles.providerInfo}>
            <Text style={styles.providerIcon}>{provider?.icon || '🔗'}</Text>
            <View style={styles.integrationDetails}>
              <Text style={styles.integrationName}>{item.name}</Text>
              <Text style={styles.providerName}>{provider?.name || item.provider}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.syncIndicator}>{syncIndicator}</Text>
          </View>
        </View>

        {/* Integration metadata */}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText}>
            Type: {item.type} • Messages: {item.metadata.messageCount}
          </Text>
          <Text style={styles.metadataText}>
            Last Updated: {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={() => handleTestConnection(item.id)}
            testID={`test-${item.id}`}
          >
            <Text style={styles.actionButtonText}>Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.syncButton]}
            onPress={() => handleSyncIntegration(item.id)}
            testID={`sync-${item.id}`}
          >
            <Text style={styles.actionButtonText}>Sync</Text>
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Switch
              value={isActive}
              onValueChange={() => handleToggleActive(item.id)}
              testID={`toggle-${item.id}`}
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteIntegration(item.id, item.name)}
            testID={`delete-${item.id}`}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [activeConfigs, getSyncStatusIndicator, getStatusColor, handleTestConnection, handleSyncIntegration, handleToggleActive, handleDeleteIntegration]);

  /**
   * Render add integration modal
   * Provides guided integration setup flow
   */
  const renderAddIntegrationModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      credentials: {}
    });

    const selectedProviderData = getProviderById(selectedProvider);

    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        testID="add-integration-modal"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Integration</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              testID="close-modal"
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Provider selection */}
            {!selectedProvider && (
              <View style={styles.providerSelection}>
                <Text style={styles.sectionTitle}>Select Integration Type</Text>
                {INTEGRATION_PROVIDERS.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    style={styles.providerCard}
                    onPress={() => setSelectedProvider(provider.id)}
                    testID={`provider-${provider.id}`}
                  >
                    <Text style={styles.providerCardIcon}>{provider.icon}</Text>
                    <View style={styles.providerCardInfo}>
                      <Text style={styles.providerCardName}>{provider.name}</Text>
                      <Text style={styles.providerCardDescription}>{provider.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Configuration form */}
            {selectedProvider && selectedProviderData && (
              <View style={styles.configurationForm}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setSelectedProvider('')}
                  testID="back-to-providers"
                >
                  <Text style={styles.backButtonText}>← Back to Providers</Text>
                </TouchableOpacity>

                <View style={styles.selectedProvider}>
                  <Text style={styles.selectedProviderIcon}>{selectedProviderData.icon}</Text>
                  <Text style={styles.selectedProviderName}>{selectedProviderData.name}</Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Integration Name</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder={`My ${selectedProviderData.name}`}
                    testID="integration-name-input"
                  />
                </View>

                {/* OAuth notice for supported providers */}
                {selectedProviderData.authType === 'oauth2' && (
                  <View style={styles.oauthNotice}>
                    <Text style={styles.oauthNoticeText}>
                      🔒 This integration uses OAuth 2.0 for secure authentication.
                      You'll be redirected to {selectedProviderData.name} to authorize access.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddIntegration({
                    name: formData.name || `My ${selectedProviderData.name}`,
                    provider: selectedProvider,
                    credentials: formData.credentials
                  })}
                  testID="confirm-add-integration"
                >
                  <Text style={styles.addButtonText}>Add Integration</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container} testID="integrations-screen">
      {/* Header with search and filters */}
      <View style={styles.header}>
        <Text style={styles.title}>Integrations</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            testID="add-integration-button"
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and filter bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search integrations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="search-input"
        />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {['all', 'email', 'messaging', 'calendar', 'storage', 'productivity'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterTab,
              filterType === type && styles.activeFilterTab
            ]}
            onPress={() => setFilterType(type as IntegrationType | 'all')}
            testID={`filter-${type}`}
          >
            <Text style={[
              styles.filterTabText,
              filterType === type && styles.activeFilterTabText
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Integrations list */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading integrations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredIntegrations}
          keyExtractor={(item) => item.id}
          renderItem={renderIntegrationItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#10B981"
            />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          testID="integrations-list"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No integrations found</Text>
              <Text style={styles.emptySubtext}>
                Add your first integration to get started
              </Text>
            </View>
          }
        />
      )}

      {/* Add integration modal */}
      {renderAddIntegrationModal()}
    </View>
  );
};

// Comprehensive styles for all UI elements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  filterTabs: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeFilterTab: {
    backgroundColor: '#10B981',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
  },
  integrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncIndicator: {
    fontSize: 16,
  },
  metadataContainer: {
    marginBottom: 16,
  },
  metadataText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  syncButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  switchContainer: {
    marginLeft: 'auto',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  providerSelection: {
    flex: 1,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerCardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  providerCardInfo: {
    flex: 1,
  },
  providerCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  providerCardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  configurationForm: {
    flex: 1,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '500',
  },
  selectedProvider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  selectedProviderIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  selectedProviderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  oauthNotice: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  oauthNoticeText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});

export default IntegrationsScreen;

/**
 * Testing Notes:
 * 
 * This component is designed for comprehensive testing:
 * 
 * 1. Unit Tests:
 *    - Test individual functions (handleAddIntegration, handleTestConnection, etc.)
 *    - Test state changes and Redux integration
 *    - Test filtering and search functionality
 * 
 * 2. Integration Tests:
 *    - Test full user flows (add integration, test connection, sync)
 *    - Test error handling and recovery
 *    - Test modal interactions
 * 
 * 3. E2E Tests:
 *    - Test complete integration setup flow
 *    - Test real API interactions (when not mocked)
 *    - Test cross-platform functionality
 * 
 * 4. Accessibility Tests:
 *    - All components have testID for automation
 *    - Screen reader compatibility
 *    - Color contrast compliance
 * 
 * 5. Performance Tests:
 *    - Large lists of integrations
 *    - Rapid user interactions
 *    - Memory usage optimization
 */ 