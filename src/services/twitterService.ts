import {
  TwitterConfig,
  TwitterCredentials,
  TwitterTweet,
  TwitterUser,
  TwitterDirectMessage,
  TwitterList,
  TwitterFilter,
  TwitterAccountInfo,
  IntegrationApiResponse,
  SyncResult
} from '../types/integrations';
import { SecurityUtils } from '../utils/security';

/**
 * Twitter Service for handling Twitter API integration
 * 
 * Features:
 * - OAuth2 authentication with Twitter API
 * - Tweet reading, posting, and management
 * - Direct message handling
 * - User management and following
 * - Search and filtering capabilities
 * - Rate limit management
 */
class TwitterService {
  private readonly TWITTER_API_BASE = 'https://api.twitter.com/2';
  private readonly TWITTER_OAUTH_BASE = 'https://twitter.com/i/oauth2/authorize';
  private readonly TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
  
  private readonly TWITTER_AUTH_SCOPE = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'dm.read',
    'dm.write',
    'offline.access',
    'follows.read',
    'follows.write',
    'like.read',
    'like.write'
  ];

  private readonly REDIRECT_URI_WEB = 'http://localhost:3000/oauth/callback';
  private readonly REDIRECT_URI_MOBILE = 'com.tldr.app://oauth/callback';

  /**
   * Generate Twitter OAuth authorization URL
   */
  async generateAuthUrl(clientId: string, platform: 'web' | 'mobile' = 'web'): Promise<IntegrationApiResponse<string>> {
    try {
      const redirectUri = platform === 'web' ? this.REDIRECT_URI_WEB : this.REDIRECT_URI_MOBILE;
      const state = this.generateSecureState();
      const codeChallenge = this.generateCodeChallenge();
      
      const authUrl = new URL(this.TWITTER_OAUTH_BASE);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', this.TWITTER_AUTH_SCOPE.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      SecurityUtils.secureLog('Twitter OAuth URL generated', {
        clientId: clientId.substring(0, 8) + '...',
        scope: this.TWITTER_AUTH_SCOPE.length + ' scopes'
      });

      return {
        success: true,
        data: authUrl.toString(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to generate auth URL:', error);
      return SecurityUtils.handleError('Failed to generate Twitter authorization URL', error);
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(
    authorizationCode: string,
    clientId: string,
    clientSecret: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<IntegrationApiResponse<TwitterCredentials>> {
    try {
      SecurityUtils.secureLog('Exchanging Twitter authorization code for tokens');

      const tokenResponse = await this.performTokenExchange(
        authorizationCode,
        clientId,
        clientSecret,
        codeVerifier,
        redirectUri
      );

      const credentials: TwitterCredentials = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        clientId,
        clientSecret,
        scope: tokenResponse.scope.split(' '),
        tokenExpiry: new Date(Date.now() + tokenResponse.expires_in * 1000),
        oauthSetupComplete: true,
        oauthSetupMethod: 'oauth2'
      };

      SecurityUtils.secureLog('Twitter OAuth tokens obtained successfully');

      return {
        success: true,
        data: credentials,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Token exchange failed:', error);
      return SecurityUtils.handleError('Failed to exchange Twitter authorization code', error);
    }
  }

  /**
   * Refresh Twitter access token
   */
  async refreshAccessToken(credentials: TwitterCredentials): Promise<IntegrationApiResponse<TwitterCredentials>> {
    try {
      SecurityUtils.secureLog('Refreshing Twitter access token');

      const refreshResponse = await this.performTokenRefresh(credentials);

      const updatedCredentials: TwitterCredentials = {
        ...credentials,
        accessToken: refreshResponse.access_token,
        refreshToken: refreshResponse.refresh_token || credentials.refreshToken,
        tokenExpiry: new Date(Date.now() + refreshResponse.expires_in * 1000)
      };

      return {
        success: true,
        data: updatedCredentials,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Token refresh failed:', error);
      return SecurityUtils.handleError('Failed to refresh Twitter access token', error);
    }
  }

  /**
   * Get user's Twitter account information
   */
  async getAccountInfo(credentials: TwitterCredentials): Promise<IntegrationApiResponse<TwitterAccountInfo>> {
    try {
      SecurityUtils.secureLog('Fetching Twitter account information');

      const accountInfo = await this.fetchAccountInfo(credentials);

      return {
        success: true,
        data: accountInfo,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to get account info:', error);
      return SecurityUtils.handleError('Failed to get Twitter account information', error);
    }
  }

  /**
   * Get user's tweets
   */
  async getTweets(
    credentials: TwitterCredentials,
    filter?: TwitterFilter
  ): Promise<IntegrationApiResponse<TwitterTweet[]>> {
    try {
      SecurityUtils.secureLog('Fetching Twitter tweets', { filter });

      const tweets = await this.fetchTweets(credentials, filter);

      return {
        success: true,
        data: tweets,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to get tweets:', error);
      return SecurityUtils.handleError('Failed to get Twitter tweets', error);
    }
  }

  /**
   * Post a new tweet
   */
  async postTweet(
    credentials: TwitterCredentials,
    text: string,
    mediaIds?: string[]
  ): Promise<IntegrationApiResponse<TwitterTweet>> {
    try {
      SecurityUtils.secureLog('Posting Twitter tweet', { textLength: text.length, mediaCount: mediaIds?.length });

      const tweet = await this.createTweet(credentials, text, mediaIds);

      return {
        success: true,
        data: tweet,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to post tweet:', error);
      return SecurityUtils.handleError('Failed to post Twitter tweet', error);
    }
  }

  /**
   * Get direct messages
   */
  async getDirectMessages(
    credentials: TwitterCredentials,
    filter?: TwitterFilter
  ): Promise<IntegrationApiResponse<TwitterDirectMessage[]>> {
    try {
      SecurityUtils.secureLog('Fetching Twitter direct messages');

      const messages = await this.fetchDirectMessages(credentials, filter);

      return {
        success: true,
        data: messages,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to get direct messages:', error);
      return SecurityUtils.handleError('Failed to get Twitter direct messages', error);
    }
  }

  /**
   * Send a direct message
   */
  async sendDirectMessage(
    credentials: TwitterCredentials,
    recipientId: string,
    text: string
  ): Promise<IntegrationApiResponse<TwitterDirectMessage>> {
    try {
      SecurityUtils.secureLog('Sending Twitter direct message', { recipientId });

      const message = await this.createDirectMessage(credentials, recipientId, text);

      return {
        success: true,
        data: message,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to send direct message:', error);
      return SecurityUtils.handleError('Failed to send Twitter direct message', error);
    }
  }

  /**
   * Search tweets
   */
  async searchTweets(
    credentials: TwitterCredentials,
    query: string,
    filter?: TwitterFilter
  ): Promise<IntegrationApiResponse<TwitterTweet[]>> {
    try {
      SecurityUtils.secureLog('Searching Twitter tweets', { query });

      const tweets = await this.performTweetSearch(credentials, query, filter);

      return {
        success: true,
        data: tweets,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to search tweets:', error);
      return SecurityUtils.handleError('Failed to search Twitter tweets', error);
    }
  }

  /**
   * Follow a user
   */
  async followUser(
    credentials: TwitterCredentials,
    userId: string
  ): Promise<IntegrationApiResponse<boolean>> {
    try {
      SecurityUtils.secureLog('Following Twitter user', { userId });

      const success = await this.performFollowUser(credentials, userId);

      return {
        success: true,
        data: success,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to follow user:', error);
      return SecurityUtils.handleError('Failed to follow Twitter user', error);
    }
  }

  /**
   * Like a tweet
   */
  async likeTweet(
    credentials: TwitterCredentials,
    tweetId: string
  ): Promise<IntegrationApiResponse<boolean>> {
    try {
      SecurityUtils.secureLog('Liking Twitter tweet', { tweetId });

      const success = await this.performLikeTweet(credentials, tweetId);

      return {
        success: true,
        data: success,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to like tweet:', error);
      return SecurityUtils.handleError('Failed to like Twitter tweet', error);
    }
  }

  /**
   * Retweet a tweet
   */
  async retweet(
    credentials: TwitterCredentials,
    tweetId: string
  ): Promise<IntegrationApiResponse<boolean>> {
    try {
      SecurityUtils.secureLog('Retweeting Twitter tweet', { tweetId });

      const success = await this.performRetweet(credentials, tweetId);

      return {
        success: true,
        data: success,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to retweet:', error);
      return SecurityUtils.handleError('Failed to retweet Twitter tweet', error);
    }
  }

  /**
   * Get user's lists
   */
  async getLists(
    credentials: TwitterCredentials
  ): Promise<IntegrationApiResponse<TwitterList[]>> {
    try {
      SecurityUtils.secureLog('Fetching Twitter lists');

      const lists = await this.fetchLists(credentials);

      return {
        success: true,
        data: lists,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Failed to get lists:', error);
      return SecurityUtils.handleError('Failed to get Twitter lists', error);
    }
  }

  /**
   * Test Twitter connection
   */
  async testConnection(credentials: TwitterCredentials): Promise<IntegrationApiResponse<boolean>> {
    try {
      SecurityUtils.secureLog('Testing Twitter connection');

      const isValid = await this.validateCredentials(credentials);

      return {
        success: true,
        data: isValid,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ TwitterService: Connection test failed:', error);
      return SecurityUtils.handleError('Failed to test Twitter connection', error);
    }
  }

  /**
   * Get setup instructions for Twitter integration
   */
  getSetupInstructions(): string[] {
    return [
      '1. Create a Twitter Developer App at https://developer.twitter.com',
      '2. Set up OAuth 2.0 with PKCE',
      '3. Add callback URL: http://localhost:3000/oauth/callback',
      '4. Note your Client ID and Client Secret',
      '5. Configure app permissions (Read, Write, Direct Messages)',
      '6. Use the generated authorization URL to authenticate',
      '7. Complete OAuth flow with authorization code'
    ];
  }

  // Private helper methods
  private async performTokenExchange(
    code: string,
    clientId: string,
    clientSecret: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<any> {
    // Mock implementation for demo
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 7200,
      scope: this.TWITTER_AUTH_SCOPE.join(' '),
      token_type: 'bearer'
    };
  }

  private async performTokenRefresh(credentials: TwitterCredentials): Promise<any> {
    // Mock implementation for demo
    return {
      access_token: 'mock_refreshed_token_' + Date.now(),
      refresh_token: credentials.refreshToken,
      expires_in: 7200,
      scope: credentials.scope.join(' '),
      token_type: 'bearer'
    };
  }

  private async fetchAccountInfo(credentials: TwitterCredentials): Promise<TwitterAccountInfo> {
    // Mock implementation for demo
    return {
      id: 'mock_user_id',
      username: 'demo_user',
      displayName: 'Demo User',
      description: 'This is a demo Twitter account for testing',
      profileImageUrl: 'https://via.placeholder.com/150',
      bannerImageUrl: 'https://via.placeholder.com/1500x500',
      location: 'Demo City, Demo Country',
      website: 'https://example.com',
      followersCount: 1234,
      followingCount: 567,
      tweetsCount: 890,
      listedCount: 12,
      verified: false,
      protected: false,
      createdAt: new Date('2020-01-01')
    };
  }

  private async fetchTweets(credentials: TwitterCredentials, filter?: TwitterFilter): Promise<TwitterTweet[]> {
    // Mock implementation for demo
    const mockTweets: TwitterTweet[] = [
      {
        id: 'tweet_1',
        text: 'This is a demo tweet from the TLDR app! 🚀 #TLDR #Demo',
        author: {
          id: 'mock_user_id',
          username: 'demo_user',
          displayName: 'Demo User',
          profileImageUrl: 'https://via.placeholder.com/150',
          followersCount: 1234,
          followingCount: 567,
          tweetsCount: 890,
          listedCount: 12,
          verified: false,
          protected: false,
          createdAt: new Date('2020-01-01')
        },
        createdAt: new Date(),
        retweetCount: 5,
        likeCount: 25,
        replyCount: 3,
        quoteCount: 1,
        isRetweet: false,
        isReply: false,
        isQuote: false,
        hashtags: ['TLDR', 'Demo'],
        mentions: [],
        urls: [],
        possiblySensitive: false,
        integrationId: 'twitter_integration'
      },
      {
        id: 'tweet_2',
        text: 'Testing the Twitter integration with OAuth2 authentication. Everything looks great! 👍',
        author: {
          id: 'mock_user_id',
          username: 'demo_user',
          displayName: 'Demo User',
          profileImageUrl: 'https://via.placeholder.com/150',
          followersCount: 1234,
          followingCount: 567,
          tweetsCount: 890,
          listedCount: 12,
          verified: false,
          protected: false,
          createdAt: new Date('2020-01-01')
        },
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        retweetCount: 2,
        likeCount: 15,
        replyCount: 1,
        quoteCount: 0,
        isRetweet: false,
        isReply: false,
        isQuote: false,
        hashtags: [],
        mentions: [],
        urls: [],
        possiblySensitive: false,
        integrationId: 'twitter_integration'
      }
    ];

    return mockTweets;
  }

  private async createTweet(credentials: TwitterCredentials, text: string, mediaIds?: string[]): Promise<TwitterTweet> {
    // Mock implementation for demo
    return {
      id: 'new_tweet_' + Date.now(),
      text,
      author: {
        id: 'mock_user_id',
        username: 'demo_user',
        displayName: 'Demo User',
        profileImageUrl: 'https://via.placeholder.com/150',
        followersCount: 1234,
        followingCount: 567,
        tweetsCount: 890,
        listedCount: 12,
        verified: false,
        protected: false,
        createdAt: new Date('2020-01-01')
      },
      createdAt: new Date(),
      retweetCount: 0,
      likeCount: 0,
      replyCount: 0,
      quoteCount: 0,
      isRetweet: false,
      isReply: false,
      isQuote: false,
      hashtags: text.match(/#\w+/g)?.map(tag => tag.slice(1)) || [],
      mentions: text.match(/@\w+/g)?.map(mention => mention.slice(1)) || [],
      urls: [],
      possiblySensitive: false,
      integrationId: 'twitter_integration'
    };
  }

  private async fetchDirectMessages(credentials: TwitterCredentials, filter?: TwitterFilter): Promise<TwitterDirectMessage[]> {
    // Mock implementation for demo
    return [
      {
        id: 'dm_1',
        text: 'Hello! This is a demo direct message.',
        sender: {
          id: 'other_user_id',
          username: 'other_user',
          displayName: 'Other User',
          profileImageUrl: 'https://via.placeholder.com/150',
          followersCount: 500,
          followingCount: 300,
          tweetsCount: 200,
          listedCount: 5,
          verified: false,
          protected: false,
          createdAt: new Date('2021-01-01')
        },
        recipient: {
          id: 'mock_user_id',
          username: 'demo_user',
          displayName: 'Demo User',
          profileImageUrl: 'https://via.placeholder.com/150',
          followersCount: 1234,
          followingCount: 567,
          tweetsCount: 890,
          listedCount: 12,
          verified: false,
          protected: false,
          createdAt: new Date('2020-01-01')
        },
        createdAt: new Date(),
        isRead: false,
        integrationId: 'twitter_integration'
      }
    ];
  }

  private async createDirectMessage(credentials: TwitterCredentials, recipientId: string, text: string): Promise<TwitterDirectMessage> {
    // Mock implementation for demo
    return {
      id: 'new_dm_' + Date.now(),
      text,
      sender: {
        id: 'mock_user_id',
        username: 'demo_user',
        displayName: 'Demo User',
        profileImageUrl: 'https://via.placeholder.com/150',
        followersCount: 1234,
        followingCount: 567,
        tweetsCount: 890,
        listedCount: 12,
        verified: false,
        protected: false,
        createdAt: new Date('2020-01-01')
      },
      recipient: {
        id: recipientId,
        username: 'recipient_user',
        displayName: 'Recipient User',
        profileImageUrl: 'https://via.placeholder.com/150',
        followersCount: 800,
        followingCount: 400,
        tweetsCount: 300,
        listedCount: 8,
        verified: false,
        protected: false,
        createdAt: new Date('2021-06-01')
      },
      createdAt: new Date(),
      isRead: false,
      integrationId: 'twitter_integration'
    };
  }

  private async performTweetSearch(credentials: TwitterCredentials, query: string, filter?: TwitterFilter): Promise<TwitterTweet[]> {
    // Mock implementation for demo
    return this.fetchTweets(credentials, filter);
  }

  private async performFollowUser(credentials: TwitterCredentials, userId: string): Promise<boolean> {
    // Mock implementation for demo
    return true;
  }

  private async performLikeTweet(credentials: TwitterCredentials, tweetId: string): Promise<boolean> {
    // Mock implementation for demo
    return true;
  }

  private async performRetweet(credentials: TwitterCredentials, tweetId: string): Promise<boolean> {
    // Mock implementation for demo
    return true;
  }

  private async fetchLists(credentials: TwitterCredentials): Promise<TwitterList[]> {
    // Mock implementation for demo
    return [
      {
        id: 'list_1',
        name: 'Tech News',
        description: 'Latest technology news and updates',
        memberCount: 150,
        subscriberCount: 25,
        mode: 'public',
        createdAt: new Date('2023-01-01'),
        owner: {
          id: 'mock_user_id',
          username: 'demo_user',
          displayName: 'Demo User',
          profileImageUrl: 'https://via.placeholder.com/150',
          followersCount: 1234,
          followingCount: 567,
          tweetsCount: 890,
          listedCount: 12,
          verified: false,
          protected: false,
          createdAt: new Date('2020-01-01')
        },
        integrationId: 'twitter_integration'
      }
    ];
  }

  private async validateCredentials(credentials: TwitterCredentials): Promise<boolean> {
    // Mock implementation for demo
    return credentials.accessToken && credentials.accessToken.length > 0;
  }

  private generateSecureState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateCodeChallenge(): string {
    // Mock PKCE code challenge generation
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default new TwitterService(); 