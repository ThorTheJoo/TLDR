import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { WhatsAppConfig } from '../types';
import { WhatsAppConfigCard } from '../components/WhatsAppConfigCard';
import {
  fetchWhatsAppConfigs,
  deleteWhatsAppConfig,
  updateWhatsAppConfig,
  testWhatsAppConnection,
} from '../store/slices/whatsappSlice';

export const WhatsAppScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { configs, isLoading, error } = useSelector((state: RootState) => state.whatsapp);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      await dispatch(fetchWhatsAppConfigs()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load configurations');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConfigs();
    setRefreshing(false);
  };

  const handleAddConfig = () => {
    navigation.navigate('WhatsAppConfig' as never);
  };

  const handleEditConfig = (config: WhatsAppConfig) => {
    navigation.navigate('WhatsAppConfig' as never, { configId: config.id } as never);
  };

  const handleDeleteConfig = async (configId: string) => {
    try {
      await dispatch(deleteWhatsAppConfig(configId)).unwrap();
      Alert.alert('Success', 'Configuration deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete configuration');
    }
  };

  const handleTestConfig = async (configId: string) => {
    try {
      const result = await dispatch(testWhatsAppConnection(configId)).unwrap();
      Alert.alert(
        result.connected ? 'Connection Successful' : 'Connection Failed',
        result.message
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test connection');
    }
  };

  const handleToggleConfig = async (configId: string, isActive: boolean) => {
    try {
      await dispatch(updateWhatsAppConfig({
        id: configId,
        config: { isActive },
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to update configuration');
    }
  };

  const handleViewMessages = (configId: string) => {
    navigation.navigate('Messages' as never, { configId } as never);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>No WhatsApp Configurations</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add your first WhatsApp configuration to start managing messages
      </Text>
      <TouchableOpacity style={styles.addFirstButton} onPress={handleAddConfig}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addFirstButtonText}>Add Configuration</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfigItem = ({ item }: { item: WhatsAppConfig }) => (
    <View style={styles.configItem}>
      <WhatsAppConfigCard
        config={item}
        onEdit={handleEditConfig}
        onDelete={handleDeleteConfig}
        onTest={handleTestConfig}
        onToggle={handleToggleConfig}
      />
      <TouchableOpacity
        style={styles.viewMessagesButton}
        onPress={() => handleViewMessages(item.id)}
      >
        <Ionicons name="chatbubble-ellipses" size={16} color="#3B82F6" />
        <Text style={styles.viewMessagesText}>View Messages</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WhatsApp</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddConfig}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {configs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={configs}
          renderItem={renderConfigItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  configItem: {
    marginBottom: 16,
  },
  viewMessagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewMessagesText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
}); 