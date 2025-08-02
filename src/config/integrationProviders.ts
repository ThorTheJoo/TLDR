import { IntegrationProvider } from '../types/integrations';

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    type: 'email',
    description: 'Connect your Gmail account to read, send, and manage emails',
    icon: '📧',
    color: '#EA4335',
    capabilities: [
      'read_emails',
      'send_emails',
      'manage_labels',
      'search_emails',
      'sync_contacts',
      'handle_attachments'
    ],
    authType: 'oauth2_file',
    supportsOAuthFile: true,
    oauthFileFormats: ['.json'],
    setupInstructions: [
      '1. Go to Google Cloud Console (console.cloud.google.com)',
      '2. Create a new project or select existing project',
      '3. Enable Gmail API in APIs & Services',
      '4. Create OAuth 2.0 credentials',
      '5. Download the JSON credentials file',
      '6. Upload the JSON file below'
    ],
    setupSteps: [
      {
        id: 'oauth_file_upload',
        title: 'Upload Google OAuth Credentials',
        description: 'Upload the JSON file you downloaded from Google Cloud Console',
        required: true,
        type: 'file_upload',
        fileUpload: {
          accept: ['.json', 'application/json'],
          maxSize: 5, // 5MB
          description: 'Upload your Google OAuth 2.0 credentials JSON file',
          validationRules: [
            {
              type: 'file_type',
              criteria: ['json'],
              errorMessage: 'Please upload a valid JSON file'
            },
            {
              type: 'json_structure',
              criteria: {
                requiredFields: ['client_id', 'client_secret'],
                rootKeys: ['web', 'installed']
              },
              errorMessage: 'Invalid Google OAuth credentials file structure'
            },
            {
              type: 'required_fields',
              criteria: ['client_id', 'client_secret', 'auth_uri', 'token_uri'],
              errorMessage: 'Missing required OAuth fields in credentials file'
            }
          ]
        },
        fields: [
          {
            name: 'oauthFile',
            label: 'Google OAuth Credentials',
            type: 'file',
            required: true,
            fileConfig: {
              accept: ['.json'],
              maxSize: 5,
              description: 'Upload your credentials.json file from Google Cloud Console',
              validationRules: [
                {
                  type: 'json_structure',
                  criteria: {
                    requiredKeys: ['client_id', 'client_secret']
                  },
                  errorMessage: 'Invalid Google OAuth file format'
                }
              ]
            }
          }
        ]
      },
      {
        id: 'oauth_authorization',
        title: 'Authorize Gmail Access',
        description: 'Complete OAuth authorization flow',
        required: true,
        type: 'oauth',
        fields: []
      },
      {
        id: 'integration_setup',
        title: 'Integration Configuration',
        description: 'Configure your Gmail integration settings',
        required: false,
        type: 'input',
        fields: [
          {
            name: 'integrationName',
            label: 'Integration Name',
            type: 'text',
            required: true,
            placeholder: 'My Gmail Account'
          },
          {
            name: 'syncFolders',
            label: 'Folders to Sync',
            type: 'select',
            required: false,
            options: ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'IMPORTANT']
          },
          {
            name: 'syncInterval',
            label: 'Sync Interval (minutes)',
            type: 'number',
            required: false,
            placeholder: '15'
          }
        ]
      },
      {
        id: 'verification',
        title: 'Test Connection',
        description: 'Verify that your Gmail integration is working correctly',
        required: true,
        type: 'verification',
        fields: []
      }
    ],
    rateLimits: {
      requestsPerMinute: 1000,
      requestsPerHour: 100000,
      requestsPerDay: 1000000,
      currentUsage: 0
    },
    pricing: {
      freeTier: {
        limit: 1000000,
        description: '1M API calls per day'
      }
    }
  },
  {
    id: 'outlook',
    name: 'Outlook',
    type: 'email',
    description: 'Connect your Outlook account for email management',
    icon: '📬',
    color: '#0078D4',
    capabilities: [
      'read_emails',
      'send_emails',
      'manage_folders',
      'search_emails',
      'sync_contacts',
      'handle_attachments'
    ],
    authType: 'oauth2',
    setupSteps: [
      {
        id: 'microsoft_auth',
        title: 'Microsoft OAuth Setup',
        description: 'Set up Microsoft Graph API credentials',
        required: true,
        type: 'oauth',
        fields: [
          {
            name: 'clientId',
            label: 'Application ID',
            type: 'text',
            required: true,
            placeholder: 'Enter your Microsoft App ID'
          },
          {
            name: 'clientSecret',
            label: 'Client Secret',
            type: 'password',
            required: true,
            placeholder: 'Enter your Microsoft Client Secret'
          }
        ]
      }
    ],
    rateLimits: {
      requestsPerMinute: 600,
      requestsPerHour: 10000,
      requestsPerDay: 100000,
      currentUsage: 0
    }
  },
  {
    id: 'slack',
    name: 'Slack',
    type: 'communication',
    description: 'Connect to Slack for team communication and messaging',
    icon: '💬',
    color: '#4A154B',
    capabilities: [
      'read_messages',
      'send_messages',
      'manage_channels',
      'search_messages',
      'sync_users',
      'handle_files'
    ],
    authType: 'oauth2',
    setupSteps: [
      {
        id: 'slack_app_setup',
        title: 'Slack App Setup',
        description: 'Create a Slack app and configure permissions',
        required: true,
        type: 'oauth',
        fields: [
          {
            name: 'clientId',
            label: 'Client ID',
            type: 'text',
            required: true,
            placeholder: 'Enter your Slack App Client ID'
          },
          {
            name: 'clientSecret',
            label: 'Client Secret',
            type: 'password',
            required: true,
            placeholder: 'Enter your Slack App Client Secret'
          }
        ]
      }
    ],
    rateLimits: {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      currentUsage: 0
    }
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    type: 'calendar',
    description: 'Sync your Google Calendar for event management',
    icon: '📅',
    color: '#4285F4',
    capabilities: [
      'read_events',
      'create_events',
      'update_events',
      'delete_events',
      'manage_calendars',
      'sync_attendees'
    ],
    authType: 'oauth2',
    setupSteps: [
      {
        id: 'calendar_oauth',
        title: 'Calendar OAuth Setup',
        description: 'Set up Google Calendar API access',
        required: true,
        type: 'oauth',
        fields: [
          {
            name: 'clientId',
            label: 'Client ID',
            type: 'text',
            required: true,
            placeholder: 'Enter your Google OAuth Client ID'
          },
          {
            name: 'clientSecret',
            label: 'Client Secret',
            type: 'password',
            required: true,
            placeholder: 'Enter your Google OAuth Client Secret'
          }
        ]
      }
    ],
    rateLimits: {
      requestsPerMinute: 1000,
      requestsPerHour: 100000,
      requestsPerDay: 1000000,
      currentUsage: 0
    }
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    type: 'storage',
    description: 'Connect to Dropbox for file storage and management',
    icon: '📁',
    color: '#0061FF',
    capabilities: [
      'read_files',
      'upload_files',
      'download_files',
      'manage_folders',
      'search_files',
      'share_files'
    ],
    authType: 'oauth2',
    setupSteps: [
      {
        id: 'dropbox_app_setup',
        title: 'Dropbox App Setup',
        description: 'Create a Dropbox app and configure permissions',
        required: true,
        type: 'oauth',
        fields: [
          {
            name: 'clientId',
            label: 'App Key',
            type: 'text',
            required: true,
            placeholder: 'Enter your Dropbox App Key'
          },
          {
            name: 'clientSecret',
            label: 'App Secret',
            type: 'password',
            required: true,
            placeholder: 'Enter your Dropbox App Secret'
          }
        ]
      }
    ],
    rateLimits: {
      requestsPerMinute: 600,
      requestsPerHour: 10000,
      requestsPerDay: 100000,
      currentUsage: 0
    }
  },
  {
    id: 'notion',
    name: 'Notion',
    type: 'productivity',
    description: 'Connect to Notion for note-taking and project management',
    icon: '📝',
    color: '#000000',
    capabilities: [
      'read_pages',
      'create_pages',
      'update_pages',
      'search_content',
      'manage_databases',
      'sync_blocks'
    ],
    authType: 'oauth2',
    setupSteps: [
      {
        id: 'notion_integration',
        title: 'Notion Integration Setup',
        description: 'Create a Notion integration and get API credentials',
        required: true,
        type: 'oauth',
        fields: [
          {
            name: 'clientId',
            label: 'Integration Token',
            type: 'password',
            required: true,
            placeholder: 'Enter your Notion Integration Token'
          }
        ]
      }
    ],
    rateLimits: {
      requestsPerMinute: 3,
      requestsPerHour: 100,
      requestsPerDay: 1000,
      currentUsage: 0
    }
  },
  {
    id: 'trello',
    name: 'Trello',
    type: 'productivity',
    description: 'Connect to Trello for project and task management',
    icon: '📋',
    color: '#0079BF',
    capabilities: [
      'read_boards',
      'create_cards',
      'update_cards',
      'manage_lists',
      'search_cards',
      'sync_members'
    ],
    authType: 'oauth2',
    setupSteps: [
      {
        id: 'trello_app_setup',
        title: 'Trello App Setup',
        description: 'Create a Trello app and configure API access',
        required: true,
        type: 'oauth',
        fields: [
          {
            name: 'clientId',
            label: 'API Key',
            type: 'text',
            required: true,
            placeholder: 'Enter your Trello API Key'
          },
          {
            name: 'clientSecret',
            label: 'API Secret',
            type: 'password',
            required: true,
            placeholder: 'Enter your Trello API Secret'
          }
        ]
      }
    ],
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      currentUsage: 0
    }
  }
];

export const getProviderById = (id: string): IntegrationProvider | undefined => {
  return INTEGRATION_PROVIDERS.find(provider => provider.id === id);
};

export const getProvidersByType = (type: string): IntegrationProvider[] => {
  return INTEGRATION_PROVIDERS.filter(provider => provider.type === type);
};

export const getAvailableProviders = (): IntegrationProvider[] => {
  return INTEGRATION_PROVIDERS;
}; 