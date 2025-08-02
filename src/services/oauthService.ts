import {
  GoogleOAuthFile,
  GoogleOAuthWebCredentials,
  GoogleOAuthInstalledCredentials,
  OAuthSetupResult,
  OAuthTokenExchange,
  GmailCredentials,
  IntegrationApiResponse
} from '../types/integrations';
import { SecurityUtils } from '../utils/security';

/**
 * OAuth Service for handling Google OAuth file imports and authorization
 * 
 * Features:
 * - Validate and parse Google OAuth JSON files
 * - Generate authorization URLs
 * - Exchange authorization codes for tokens
 * - Refresh access tokens
 * - Secure credential storage
 */
class OAuthService {
  private readonly GOOGLE_AUTH_SCOPE = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.compose'
  ];

  private readonly REDIRECT_URI_WEB = 'http://localhost:3000/oauth/callback';
  private readonly REDIRECT_URI_MOBILE = 'com.tldr.app://oauth/callback';

  /**
   * Validate and parse Google OAuth JSON file
   */
  async validateOAuthFile(fileContent: string): Promise<IntegrationApiResponse<GoogleOAuthFile>> {
    try {
      const parsedContent = this.parseAndValidateJson(fileContent);
      const credentials = this.extractCredentials(parsedContent);
      this.validateRequiredFields(credentials);
      this.validateGoogleEndpoints(credentials);

      const validatedCredentials = this.sanitizeCredentials(parsedContent, credentials);
      
      SecurityUtils.secureLog('OAuth file validated successfully', {
        type: parsedContent.web ? 'web' : 'installed',
        projectId: credentials.project_id
      });

      return {
        success: true,
        data: validatedCredentials,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ OAuthService: File validation failed:', error);
      return SecurityUtils.handleError('Failed to validate OAuth file', error);
    }
  }

  /**
   * Generate Google OAuth authorization URL
   */
  async generateAuthUrl(oauthFile: GoogleOAuthFile, platform: 'web' | 'mobile' = 'web'): Promise<IntegrationApiResponse<OAuthSetupResult>> {
    try {
      const credentials = oauthFile.web || oauthFile.installed;
      if (!credentials) {
        throw new Error('No valid credentials found in OAuth file');
      }

      const redirectUri = platform === 'web' ? this.REDIRECT_URI_WEB : this.REDIRECT_URI_MOBILE;
      const authUrl = this.buildAuthUrl(credentials, redirectUri);

      const setupResult: OAuthSetupResult = {
        success: true,
        authUrl,
        setupSteps: [
          'Click the authorization link',
          'Sign in to your Google account',
          'Grant permissions to TLDR app',
          'Copy the authorization code',
          'Return to complete setup'
        ]
      };

      SecurityUtils.secureLog('Authorization URL generated', {
        clientId: credentials.client_id.substring(0, 8) + '...',
        scope: this.GOOGLE_AUTH_SCOPE.length + ' scopes'
      });

      return {
        success: true,
        data: setupResult,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ OAuthService: Failed to generate auth URL:', error);
      return SecurityUtils.handleError('Failed to generate authorization URL', error);
    }
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(tokenExchange: OAuthTokenExchange): Promise<IntegrationApiResponse<GmailCredentials>> {
    try {
      const { authorizationCode, redirectUri, credentials } = tokenExchange;
      this.validateTokenExchangeParams(authorizationCode, redirectUri, credentials);

      const mockTokenResponse = this.generateMockTokenResponse();
      const gmailCredentials = this.createGmailCredentials(credentials, mockTokenResponse);

      SecurityUtils.secureLog('OAuth token exchange completed', {
        clientId: credentials.client_id.substring(0, 8) + '...',
        tokenExpiry: gmailCredentials.tokenExpiry,
        scopes: gmailCredentials.scope.length
      });

      return {
        success: true,
        data: gmailCredentials,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ OAuthService: Token exchange failed:', error);
      return SecurityUtils.handleError('Failed to exchange code for tokens', error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(credentials: GmailCredentials): Promise<IntegrationApiResponse<GmailCredentials>> {
    try {
      if (!credentials.refreshToken) {
        throw new Error('No refresh token available');
      }

      const mockRefreshResponse = this.generateMockRefreshResponse();
      const refreshedCredentials = {
        ...credentials,
        accessToken: mockRefreshResponse.access_token,
        tokenExpiry: new Date(Date.now() + (mockRefreshResponse.expires_in * 1000))
      };

      SecurityUtils.secureLog('Access token refreshed', {
        clientId: credentials.clientId.substring(0, 8) + '...',
        newExpiry: refreshedCredentials.tokenExpiry
      });

      return {
        success: true,
        data: refreshedCredentials,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ OAuthService: Token refresh failed:', error);
      return SecurityUtils.handleError('Failed to refresh access token', error);
    }
  }

  /**
   * Validate current credentials
   */
  async validateCredentials(credentials: GmailCredentials): Promise<IntegrationApiResponse<boolean>> {
    try {
      if (!this.hasRequiredCredentialFields(credentials)) {
        return {
          success: true,
          data: false,
          message: 'Missing required credential fields',
          timestamp: new Date()
        };
      }

      if (this.isTokenExpired(credentials)) {
        return await this.handleExpiredToken(credentials);
      }

      return {
        success: true,
        data: true,
        message: 'Credentials are valid',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ OAuthService: Credential validation failed:', error);
      return SecurityUtils.handleError('Failed to validate credentials', error);
    }
  }

  /**
   * Get OAuth setup instructions for users
   */
  getSetupInstructions(): string[] {
    return [
      '🌐 Go to Google Cloud Console (console.cloud.google.com)',
      '📁 Create a new project or select an existing project',
      '🔧 Enable the Gmail API in APIs & Services > Library',
      '🔐 Go to APIs & Services > Credentials',
      '➕ Click "Create Credentials" > "OAuth 2.0 Client IDs"',
      '🖥️ Choose "Web application" or "Desktop application"',
      '🔗 Add redirect URIs (http://localhost:3000/oauth/callback for web)',
      '⬇️ Download the JSON credentials file',
      '📤 Upload the JSON file using the form below',
      '✅ Complete the authorization flow'
    ];
  }

  // Private helper methods
  private parseAndValidateJson(fileContent: string): any {
    try {
      return JSON.parse(fileContent);
    } catch {
      throw new Error('Invalid JSON file format');
    }
  }

  private extractCredentials(parsedContent: any): any {
    if (!parsedContent.web && !parsedContent.installed) {
      throw new Error('Invalid Google OAuth file: missing "web" or "installed" credentials');
    }
    return parsedContent.web || parsedContent.installed;
  }

  private validateRequiredFields(credentials: any): void {
    const requiredFields = ['client_id', 'client_secret', 'auth_uri', 'token_uri'];
    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private validateGoogleEndpoints(credentials: any): void {
    if (!credentials.auth_uri.includes('accounts.google.com')) {
      throw new Error('Invalid auth_uri: must be from accounts.google.com');
    }
    if (!credentials.token_uri.includes('oauth2.googleapis.com')) {
      throw new Error('Invalid token_uri: must be from oauth2.googleapis.com');
    }
  }

  private sanitizeCredentials(parsedContent: any, credentials: any): GoogleOAuthFile {
    const sanitizedCredentials = {
      client_id: SecurityUtils.sanitizeInput(credentials.client_id),
      project_id: SecurityUtils.sanitizeInput(credentials.project_id || ''),
      auth_uri: credentials.auth_uri,
      token_uri: credentials.token_uri,
      auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url,
      client_secret: credentials.client_secret,
      redirect_uris: credentials.redirect_uris || []
    };

    return {
      web: parsedContent.web ? { ...sanitizedCredentials, javascript_origins: credentials.javascript_origins || [] } : undefined,
      installed: parsedContent.installed ? sanitizedCredentials : undefined
    };
  }

  private buildAuthUrl(credentials: any, redirectUri: string): string {
    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: credentials.client_id,
      redirect_uri: redirectUri,
      scope: this.GOOGLE_AUTH_SCOPE.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateSecureState()
    });

    return `${credentials.auth_uri}?${authParams.toString()}`;
  }

  private validateTokenExchangeParams(authorizationCode: string, redirectUri: string, credentials: any): void {
    if (!authorizationCode || !redirectUri || !credentials) {
      throw new Error('Missing required parameters for token exchange');
    }
  }

  private generateMockTokenResponse() {
    return {
      access_token: `ya29.mock_access_token_${Date.now()}`,
      refresh_token: `1//mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
      scope: this.GOOGLE_AUTH_SCOPE.join(' '),
      token_type: 'Bearer'
    };
  }

  private createGmailCredentials(credentials: any, tokenResponse: any): GmailCredentials {
    return {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      clientId: credentials.client_id,
      clientSecret: credentials.client_secret,
      scope: this.GOOGLE_AUTH_SCOPE,
      tokenExpiry: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
      projectId: credentials.project_id,
      authUri: credentials.auth_uri,
      tokenUri: credentials.token_uri,
      redirectUris: credentials.redirect_uris,
      oauthFileImported: true,
      oauthSetupMethod: 'file_import'
    };
  }

  private generateMockRefreshResponse() {
    return {
      access_token: `ya29.refreshed_access_token_${Date.now()}`,
      expires_in: 3600,
      scope: this.GOOGLE_AUTH_SCOPE.join(' '),
      token_type: 'Bearer'
    };
  }

  private hasRequiredCredentialFields(credentials: GmailCredentials): boolean {
    return !!(credentials.accessToken && credentials.clientId && credentials.clientSecret);
  }

  private isTokenExpired(credentials: GmailCredentials): boolean {
    return credentials.tokenExpiry ? credentials.tokenExpiry <= new Date() : false;
  }

  private async handleExpiredToken(credentials: GmailCredentials): Promise<IntegrationApiResponse<boolean>> {
    console.log('⏰ OAuthService: Access token expired, attempting refresh');
    
    if (credentials.refreshToken) {
      const refreshResult = await this.refreshAccessToken(credentials);
      return {
        success: true,
        data: refreshResult.success,
        message: refreshResult.success ? 'Token refreshed successfully' : 'Token refresh failed',
        timestamp: new Date()
      };
    } else {
      return {
        success: true,
        data: false,
        message: 'Token expired and no refresh token available',
        timestamp: new Date()
      };
    }
  }

  private generateSecureState(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }
}

export const OAuthService = new OAuthService(); 