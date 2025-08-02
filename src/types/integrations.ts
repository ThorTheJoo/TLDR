// Core Integration Types
export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  provider: string;
  status: IntegrationStatus;
  credentials: IntegrationCredentials;
  settings: IntegrationSettings;
  metadata: IntegrationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export type IntegrationType = 
  | 'email'
  | 'messaging'
  | 'calendar'
  | 'storage'
  | 'social'
  | 'productivity'
  | 'communication'
  | 'custom';

export type IntegrationStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'pending'
  | 'disconnected';

export interface IntegrationCredentials {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  webhookUrl?: string;
  customFields?: Record<string, any>;
  oauthFile?: GoogleOAuthFile;
  authType?: 'oauth_file' | 'manual' | 'token';
}

export interface IntegrationSettings {
  autoSync: boolean;
  notifications: boolean;
  syncInterval: number; // minutes
  maxRetries: number;
  timeout: number; // seconds
  filters?: Record<string, any>;
  preferences?: Record<string, any>;
}

export interface IntegrationMetadata {
  description?: string;
  version: string;
  capabilities: string[];
  rateLimits?: RateLimitInfo;
  lastSync?: Date;
  errorCount: number;
  messageCount: number;
  oauthSetupComplete?: boolean;
  lastOAuthRefresh?: Date;
  oauthErrors?: string[];
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentUsage: number;
  resetTime?: Date;
}

// Google OAuth Types
export interface GoogleOAuthFile {
  web?: GoogleOAuthWebCredentials;
  installed?: GoogleOAuthInstalledCredentials;
}

export interface GoogleOAuthWebCredentials {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_secret: string;
  redirect_uris: string[];
  javascript_origins?: string[];
}

export interface GoogleOAuthInstalledCredentials {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_secret: string;
  redirect_uris: string[];
}

export interface OAuthSetupResult {
  success: boolean;
  authUrl?: string;
  credentials?: GmailCredentials;
  error?: string;
  setupSteps?: string[];
}

export interface OAuthTokenExchange {
  authorizationCode: string;
  redirectUri: string;
  credentials: GoogleOAuthWebCredentials | GoogleOAuthInstalledCredentials;
}

// Gmail Specific Types
export interface GmailConfig extends IntegrationConfig {
  type: 'email';
  provider: 'gmail';
  credentials: GmailCredentials;
  settings: GmailSettings;
  metadata: GmailMetadata;
}

export interface GmailCredentials {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  tokenExpiry?: Date;
  projectId?: string;
  authUri?: string;
  tokenUri?: string;
  redirectUris?: string[];
  oauthFileImported?: boolean;
  oauthSetupMethod?: 'file_import' | 'manual_entry';
}

export interface GmailSettings extends IntegrationSettings {
  syncFolders: string[];
  syncAttachments: boolean;
  maxAttachmentSize: number; // MB
  autoArchive: boolean;
  spamFilter: boolean;
  priorityInbox: boolean;
  filters: GmailFilters;
}

export interface GmailFilters {
  fromAddresses?: string[];
  toAddresses?: string[];
  subjectKeywords?: string[];
  hasAttachments?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  labels?: string[];
  isRead?: boolean;
  isStarred?: boolean;
}

export interface GmailMetadata extends IntegrationMetadata {
  capabilities: [
    'read_emails',
    'send_emails',
    'manage_labels',
    'search_emails',
    'sync_contacts',
    'handle_attachments'
  ];
  accountInfo?: GmailAccountInfo;
  quotaInfo?: GmailQuotaInfo;
  oauthSetupComplete?: boolean;
  hasValidCredentials?: boolean;
}

export interface GmailAccountInfo {
  email: string;
  name: string;
  picture?: string;
  totalEmails: number;
  unreadCount: number;
  labels: GmailLabel[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messageListVisibility?: string;
  labelListVisibility?: string;
  messagesTotal: number;
  messagesUnread: number;
}

export interface GmailQuotaInfo {
  quotaTotal: number;
  quotaUsed: number;
  quotaRemaining: number;
}

// Twitter Integration Types
export interface TwitterConfig extends IntegrationConfig {
  type: 'social';
  provider: 'twitter';
  credentials: TwitterCredentials;
  settings: TwitterSettings;
  metadata: TwitterMetadata;
}

export interface TwitterCredentials {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
  tokenExpiry?: Date;
  apiKey?: string;
  apiSecret?: string;
  bearerToken?: string;
  userId?: string;
  username?: string;
  oauthSetupComplete?: boolean;
  oauthSetupMethod?: 'oauth2' | 'api_keys';
}

export interface TwitterSettings extends IntegrationSettings {
  autoSyncTweets: boolean;
  autoSyncMentions: boolean;
  autoSyncDMs: boolean;
  syncRetweets: boolean;
  syncLikes: boolean;
  maxTweetsPerSync: number;
  includeMedia: boolean;
  filters: TwitterFilters;
}

export interface TwitterFilters {
  keywords?: string[];
  hashtags?: string[];
  mentions?: string[];
  excludeRetweets?: boolean;
  excludeReplies?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  language?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface TwitterMetadata extends IntegrationMetadata {
  capabilities: [
    'read_tweets',
    'post_tweets',
    'read_dms',
    'send_dms',
    'manage_lists',
    'follow_users',
    'search_tweets',
    'analytics'
  ];
  accountInfo?: TwitterAccountInfo;
  rateLimitInfo?: TwitterRateLimitInfo;
  oauthSetupComplete?: boolean;
  hasValidCredentials?: boolean;
}

export interface TwitterAccountInfo {
  id: string;
  username: string;
  displayName: string;
  description?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  listedCount: number;
  verified: boolean;
  protected: boolean;
  createdAt: Date;
}

export interface TwitterRateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
  endpoint: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  author: TwitterUser;
  createdAt: Date;
  retweetCount: number;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
  isRetweet: boolean;
  isReply: boolean;
  isQuote: boolean;
  inReplyToStatusId?: string;
  quotedStatusId?: string;
  retweetedStatus?: TwitterTweet;
  quotedStatus?: TwitterTweet;
  media?: TwitterMedia[];
  hashtags: string[];
  mentions: string[];
  urls: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  place?: TwitterPlace;
  language?: string;
  possiblySensitive: boolean;
  integrationId: string;
}

export interface TwitterUser {
  id: string;
  username: string;
  displayName: string;
  description?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
  listedCount: number;
  verified: boolean;
  protected: boolean;
  createdAt: Date;
}

export interface TwitterMedia {
  id: string;
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  previewImageUrl?: string;
  altText?: string;
  duration?: number; // for videos
  variants?: TwitterMediaVariant[];
}

export interface TwitterMediaVariant {
  bitrate?: number;
  contentType: string;
  url: string;
}

export interface TwitterPlace {
  id: string;
  name: string;
  fullName: string;
  country?: string;
  countryCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TwitterDirectMessage {
  id: string;
  text: string;
  sender: TwitterUser;
  recipient: TwitterUser;
  createdAt: Date;
  media?: TwitterMedia[];
  isRead: boolean;
  integrationId: string;
}

export interface TwitterList {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  subscriberCount: number;
  mode: 'public' | 'private';
  createdAt: Date;
  owner: TwitterUser;
  integrationId: string;
}

export interface TwitterFilter {
  keywords?: string[];
  hashtags?: string[];
  mentions?: string[];
  fromUser?: string;
  toUser?: string;
  excludeRetweets?: boolean;
  excludeReplies?: boolean;
  language?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  integrationId?: string;
}

// Email Message Types
export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  body: EmailBody;
  attachments?: EmailAttachment[];
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  date: Date;
  snippet: string;
  integrationId: string;
}

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailBody {
  plainText?: string;
  html?: string;
  textFormat: 'plain' | 'html' | 'both';
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data?: string; // base64 encoded
  url?: string;
}

// Integration Provider Types
export interface IntegrationProvider {
  id: string;
  name: string;
  type: IntegrationType;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
  authType: AuthType;
  setupSteps: SetupStep[];
  rateLimits?: RateLimitInfo;
  pricing?: PricingInfo;
  supportsOAuthFile?: boolean;
  oauthFileFormats?: string[];
  setupInstructions?: string[];
}

export type AuthType = 
  | 'oauth2'
  | 'oauth2_file'
  | 'api_key'
  | 'username_password'
  | 'webhook'
  | 'custom';

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  type: 'input' | 'oauth' | 'webhook' | 'verification' | 'file_upload';
  fields?: SetupField[];
  fileUpload?: FileUploadConfig;
}

export interface FileUploadConfig {
  accept: string[];
  maxSize: number;
  description: string;
  validationRules?: FileValidationRule[];
}

export interface FileValidationRule {
  type: 'file_type' | 'json_structure' | 'required_fields';
  criteria: any;
  errorMessage: string;
}

export interface SetupField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'url' | 'number' | 'select' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: ValidationRule[];
  fileConfig?: FileUploadConfig;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'min_length' | 'max_length' | 'pattern' | 'json_valid';
  value?: any;
  message: string;
}

export interface PricingInfo {
  freeTier?: {
    limit: number;
    description: string;
  };
  paidTiers?: PricingTier[];
}

export interface PricingTier {
  name: string;
  price: number;
  currency: string;
  limit: number;
  features: string[];
}

// State Management Types
export interface IntegrationsState {
  configs: IntegrationConfig[];
  activeConfigs: string[];
  loading: boolean;
  error: string | null;
  lastSync: Record<string, Date>;
  syncStatus: Record<string, SyncStatus>;
  oauthSetup: Record<string, OAuthSetupState>;
}

export interface OAuthSetupState {
  step: 'file_upload' | 'authorize' | 'token_exchange' | 'complete' | 'error';
  authUrl?: string;
  credentials?: Partial<GmailCredentials>;
  error?: string;
  progress: number; // 0-100
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync: Date;
  itemsProcessed: number;
  error?: string;
}

// API Response Types
export interface IntegrationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface SyncResult {
  integrationId: string;
  status: 'success' | 'partial' | 'error';
  itemsProcessed: number;
  itemsFailed: number;
  errors: string[];
  duration: number; // milliseconds
}

// Event Types
export interface IntegrationEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'config_updated' | 'config_deleted' | 'oauth_started' | 'oauth_completed' | 'oauth_failed';
  integrationId: string;
  timestamp: Date;
  data?: any;
}

// Filter and Search Types
export interface IntegrationFilter {
  type?: IntegrationType;
  status?: IntegrationStatus;
  provider?: string;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface EmailFilter {
  from?: string;
  to?: string;
  subject?: string;
  hasAttachments?: boolean;
  isRead?: boolean;
  isStarred?: boolean;
  labels?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  integrationId?: string;
} 