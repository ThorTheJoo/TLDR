import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { WhatsAppMessage } from '../types';
import {
  fetchMessages,
  sendMessage,
  deleteMessage,
  markMessageAsRead,
  setFilters,
  clearFilters,
} from '../store/slices/messagesSlice';

interface RouteParams {
  configId: string;
}

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { messages, filteredMessages, isLoading, pagination } = useSelector(
    (state: RootState) => state.messages
  );
  const { configs } = useSelector((state: RootState) => state.whatsapp);

  const params = route.params as RouteParams;
  const config = configs.find(c => c.id === params.configId);

  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [params.configId]);

  const loadMessages = async () => {
    try {
      await dispatch(fetchMessages({
        configId: params.configId,
        page: 1,
        limit: 20,
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (pagination.hasMore && !isLoading) {
      try {
        await dispatch(fetchMessages({
          configId: params.configId,
          page: pagination.page + 1,
          limit: pagination.limit,
        })).unwrap();
      } catch (error) {
        Alert.alert('Error', 'Failed to load more messages');
      }
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    dispatch(setFilters({ search: text }));
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMessage(messageId)).unwrap();
              Alert.alert('Success', 'Message deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await dispatch(markMessageAsRead(messageId)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark message as read');
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return 'checkmark';
      case 'delivered':
        return 'checkmark-done';
      case 'read':
        return 'checkmark-done';
      case 'failed':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return '#6B7280';
      case 'delivered':
        return '#3B82F6';
      case 'read':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const renderMessage = ({ item }: { item: WhatsAppMessage }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageInfo}>
          <Text style={styles.messageFrom}>{item.from}</Text>
          <Text style={styles.messageTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <View style={styles.messageActions}>
          <Ionicons
            name={getStatusIcon(item.status)}
            size={16}
            color={getStatusColor(item.status)}
          />
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMessage(item.id)}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.messageContent} numberOfLines={3}>
        {item.content}
      </Text>
      {item.type !== 'text' && (
        <View style={styles.messageType}>
          <Ionicons
            name={item.type === 'media' ? 'image' : item.type === 'document' ? 'document' : 'location'}
            size={14}
            color="#6B7280"
          />
          <Text style={styles.messageTypeText}>{item.type}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>No Messages</Text>
      <Text style={styles.emptyStateSubtitle}>
        Messages from this configuration will appear here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {config?.name || 'Messages'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {pagination.total} messages
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchTextInput}
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Search messages..."
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => handleSearch('')}
            >
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filters</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Unread</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  clearSearchButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: {
    fontSize: 12,
    color: '#374151',
  },
  listContainer: {
    paddingVertical: 8,
  },
  messageItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  messageContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  messageType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  messageTypeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 