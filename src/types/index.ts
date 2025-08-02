// Core App Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
}

// WhatsApp Integration Types
export interface WhatsAppConfig {
  id: string;
  name: string;
  phoneNumber: string;
  apiKey?: string;
  webhookUrl?: string;
  isActive: boolean;
  lastSync?: Date;
  syncInterval: number; // in minutes
  autoReply: boolean;
  autoReplyMessage?: string;
}

export interface WhatsAppMessage {
  id: string;
  configId: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'media' | 'document' | 'location';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string;
  metadata?: Record<string, any>;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

// Space and Organization Types
export interface Space {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  spaceId?: string;
}

// AI and Processing Types
export interface Insight {
  id: string;
  type: 'reminder' | 'task' | 'event' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  spaceId?: string;
  tags: string[];
  source: 'whatsapp' | 'email' | 'calendar' | 'drive';
  isCompleted: boolean;
  createdAt: Date;
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  items: TimelineItem[];
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'message' | 'event' | 'task';
  source: string;
}

// App State Types
export interface AppState {
  user: User | null;
  spaces: Space[];
  whatsappConfigs: WhatsAppConfig[];
  messages: WhatsAppMessage[];
  insights: Insight[];
  timeline: Timeline[];
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  WhatsApp: undefined;
  WhatsAppConfig: { configId?: string };
  Messages: { configId: string };
  Spaces: undefined;
  Settings: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  WhatsApp: undefined;
  Spaces: undefined;
  Insights: undefined;
  Settings: undefined;
}; 