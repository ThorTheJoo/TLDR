import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { WhatsAppConfig, Insight } from '../types';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { configs } = useSelector((state: RootState) => state.whatsapp);
  const { messages } = useSelector((state: RootState) => state.messages);

  const [stats, setStats] = useState({
    totalConfigs: 0,
    activeConfigs: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    updateStats();
  }, [configs, messages]);

  const updateStats = () => {
    setStats({
      totalConfigs: configs.length,
      activeConfigs: configs.filter(c => c.isActive).length,
      totalMessages: messages.length,
      unreadMessages: messages.filter(m => m.status === 'sent').length,
    });
  };

  const quickActions = [
    {
      title: 'WhatsApp',
      subtitle: 'Manage configurations',
      icon: 'chatbubbles',
      color: '#10B981',
      onPress: () => navigation.navigate('WhatsApp' as never),
    },
    {
      title: 'Messages',
      subtitle: 'View all messages',
      icon: 'mail',
      color: '#3B82F6',
      onPress: () => navigation.navigate('Messages' as never, { configId: 'all' } as never),
    },
    {
      title: 'Spaces',
      subtitle: 'Organize your data',
      icon: 'folder',
      color: '#F59E0B',
      onPress: () => navigation.navigate('Spaces' as never),
    },
    {
      title: 'Settings',
      subtitle: 'Configure app',
      icon: 'settings',
      color: '#6B7280',
      onPress: () => navigation.navigate('Settings' as never),
    },
  ];

  const recentActivity = [
    {
      type: 'message',
      title: 'New message from +1234567890',
      time: '2 minutes ago',
      icon: 'chatbubble',
      color: '#10B981',
    },
    {
      type: 'config',
      title: 'WhatsApp configuration updated',
      time: '1 hour ago',
      icon: 'settings',
      color: '#3B82F6',
    },
    {
      type: 'sync',
      title: 'Messages synced successfully',
      time: '3 hours ago',
      icon: 'sync',
      color: '#F59E0B',
    },
  ];

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.title}
      style={styles.quickActionCard}
      onPress={action.onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderActivityItem = (activity: any) => (
    <View key={activity.title} style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
        <Ionicons name={activity.icon as any} size={16} color="#FFFFFF" />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.subtitle}>Here's what's happening with your TLDR</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={32} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {renderStatCard('Configurations', stats.totalConfigs, 'settings', '#3B82F6')}
          {renderStatCard('Active', stats.activeConfigs, 'checkmark-circle', '#10B981')}
          {renderStatCard('Messages', stats.totalMessages, 'mail', '#F59E0B')}
          {renderStatCard('Unread', stats.unreadMessages, 'mail-unread', '#EF4444')}
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      <View style={styles.recentActivityContainer}>
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {recentActivity.map(renderActivityItem)}
        </View>
      </View>

      {configs.length === 0 && (
        <View style={styles.onboardingContainer}>
          <View style={styles.onboardingCard}>
            <Ionicons name="rocket" size={48} color="#10B981" />
            <Text style={styles.onboardingTitle}>Get Started</Text>
            <Text style={styles.onboardingSubtitle}>
              Set up your first WhatsApp configuration to start managing messages
            </Text>
            <TouchableOpacity
              style={styles.onboardingButton}
              onPress={() => navigation.navigate('WhatsApp' as never)}
            >
              <Text style={styles.onboardingButtonText}>Add Configuration</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
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
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (width - 48) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  quickActionsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  recentActivityContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  onboardingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  onboardingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  onboardingButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  onboardingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 