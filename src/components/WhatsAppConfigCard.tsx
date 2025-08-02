import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WhatsAppConfig } from '../types';

interface WhatsAppConfigCardProps {
  config: WhatsAppConfig;
  onEdit: (config: WhatsAppConfig) => void;
  onDelete: (configId: string) => void;
  onTest: (configId: string) => void;
  onToggle: (configId: string, isActive: boolean) => void;
}

export const WhatsAppConfigCard: React.FC<WhatsAppConfigCardProps> = ({
  config,
  onEdit,
  onDelete,
  onTest,
  onToggle,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Configuration',
      `Are you sure you want to delete "${config.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(config.id) },
      ]
    );
  };

  const getStatusColor = () => {
    if (!config.isActive) return '#6B7280';
    if (config.lastSync) {
      const timeSinceSync = Date.now() - config.lastSync.getTime();
      if (timeSinceSync < 5 * 60 * 1000) return '#10B981'; // Green - synced within 5 minutes
      if (timeSinceSync < 30 * 60 * 1000) return '#F59E0B'; // Yellow - synced within 30 minutes
      return '#EF4444'; // Red - not synced recently
    }
    return '#6B7280'; // Gray - no sync data
  };

  const getStatusText = () => {
    if (!config.isActive) return 'Inactive';
    if (config.lastSync) {
      const timeSinceSync = Date.now() - config.lastSync.getTime();
      if (timeSinceSync < 5 * 60 * 1000) return 'Connected';
      if (timeSinceSync < 30 * 60 * 1000) return 'Syncing...';
      return 'Disconnected';
    }
    return 'Not Connected';
  };

  const formatLastSync = () => {
    if (!config.lastSync) return 'Never';
    const now = new Date();
    const diff = now.getTime() - config.lastSync.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{config.name}</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => onToggle(config.id, !config.isActive)}
        >
          <Ionicons
            name={config.isActive ? 'toggle' : 'toggle-outline'}
            size={24}
            color={config.isActive ? '#10B981' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{config.phoneNumber}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            Sync: {config.syncInterval}min • Last: {formatLastSync()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="chatbubble" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            Auto-reply: {config.autoReply ? 'On' : 'Off'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="information-circle" size={16} color="#6B7280" />
          <Text style={styles.detailText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.testButton]}
          onPress={() => onTest(config.id)}
        >
          <Ionicons name="wifi" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(config)}
        >
          <Ionicons name="create" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleButton: {
    padding: 4,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  editButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 