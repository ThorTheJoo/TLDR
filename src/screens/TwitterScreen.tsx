import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import TwitterService from '../services/twitterService';
import {
  TwitterCredentials,
  TwitterTweet,
  TwitterDirectMessage,
  TwitterAccountInfo,
  TwitterFilter
} from '../types/integrations';

const TwitterScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<TwitterCredentials | null>(null);
  const [accountInfo, setAccountInfo] = useState<TwitterAccountInfo | null>(null);
  const [tweets, setTweets] = useState<TwitterTweet[]>([]);
  const [directMessages, setDirectMessages] = useState<TwitterDirectMessage[]>([]);
  const [newTweetText, setNewTweetText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [codeVerifier, setCodeVerifier] = useState('');
  const [showOAuthSetup, setShowOAuthSetup] = useState(false);
  const [showTweetComposer, setShowTweetComposer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDMs, setShowDMs] = useState(false);
  const [filters, setFilters] = useState<TwitterFilter>({});

  // Mock credentials for demo
  const mockCredentials: TwitterCredentials = {
    accessToken: 'mock_access_token_demo',
    refreshToken: 'mock_refresh_token_demo',
    clientId: 'demo_client_id',
    clientSecret: 'demo_client_secret',
    scope: ['tweet.read', 'tweet.write', 'users.read', 'dm.read', 'dm.write'],
    oauthSetupComplete: true,
    oauthSetupMethod: 'oauth2'
  };

  useEffect(() => {
    // Initialize with mock credentials for demo
    setCredentials(mockCredentials);
    loadAccountInfo();
    loadTweets();
  }, []);

  const loadAccountInfo = async () => {
    if (!credentials) return;
    
    setLoading(true);
    try {
      const response = await TwitterService.getAccountInfo(credentials);
      if (response.success && response.data) {
        setAccountInfo(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const loadTweets = async () => {
    if (!credentials) return;
    
    setLoading(true);
    try {
      const response = await TwitterService.getTweets(credentials, filters);
      if (response.success && response.data) {
        setTweets(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tweets');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectMessages = async () => {
    if (!credentials) return;
    
    setLoading(true);
    try {
      const response = await TwitterService.getDirectMessages(credentials, filters);
      if (response.success && response.data) {
        setDirectMessages(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load direct messages');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSetup = async () => {
    if (!clientId.trim()) {
      Alert.alert('Error', 'Please enter your Twitter Client ID');
      return;
    }

    setLoading(true);
    try {
      const response = await TwitterService.generateAuthUrl(clientId);
      if (response.success && response.data) {
        Alert.alert(
          'OAuth Setup',
          `Authorization URL generated!\n\n${response.data}\n\nCopy this URL and open it in your browser to authorize the app.`,
          [
            { text: 'Copy URL', onPress: () => {/* Copy to clipboard */} },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate authorization URL');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenExchange = async () => {
    if (!authCode.trim() || !clientId.trim() || !clientSecret.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await TwitterService.exchangeCodeForTokens(
        authCode,
        clientId,
        clientSecret,
        codeVerifier || 'mock_code_verifier',
        'http://localhost:3000/oauth/callback'
      );
      
      if (response.success && response.data) {
        setCredentials(response.data);
        Alert.alert('Success', 'Twitter OAuth setup completed!');
        setShowOAuthSetup(false);
        loadAccountInfo();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to exchange authorization code');
    } finally {
      setLoading(false);
    }
  };

  const handlePostTweet = async () => {
    if (!credentials || !newTweetText.trim()) {
      Alert.alert('Error', 'Please enter tweet text');
      return;
    }

    setLoading(true);
    try {
      const response = await TwitterService.postTweet(credentials, newTweetText);
      if (response.success && response.data) {
        setTweets([response.data, ...tweets]);
        setNewTweetText('');
        setShowTweetComposer(false);
        Alert.alert('Success', 'Tweet posted successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post tweet');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTweets = async () => {
    if (!credentials || !searchQuery.trim()) {
      Alert.alert('Error', 'Please enter search query');
      return;
    }

    setLoading(true);
    try {
      const response = await TwitterService.searchTweets(credentials, searchQuery, filters);
      if (response.success && response.data) {
        setTweets(response.data);
        setShowSearch(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search tweets');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTweet = async (tweetId: string) => {
    if (!credentials) return;

    try {
      const response = await TwitterService.likeTweet(credentials, tweetId);
      if (response.success) {
        // Update tweet in local state
        setTweets(tweets.map(tweet => 
          tweet.id === tweetId 
            ? { ...tweet, likeCount: tweet.likeCount + 1 }
            : tweet
        ));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to like tweet');
    }
  };

  const handleRetweet = async (tweetId: string) => {
    if (!credentials) return;

    try {
      const response = await TwitterService.retweet(credentials, tweetId);
      if (response.success) {
        // Update tweet in local state
        setTweets(tweets.map(tweet => 
          tweet.id === tweetId 
            ? { ...tweet, retweetCount: tweet.retweetCount + 1 }
            : tweet
        ));
        Alert.alert('Success', 'Tweet retweeted successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retweet');
    }
  };

  const handleFollowUser = async (userId: string) => {
    if (!credentials) return;

    try {
      const response = await TwitterService.followUser(credentials, userId);
      if (response.success) {
        Alert.alert('Success', 'User followed successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to follow user');
    }
  };

  const renderTweet = ({ item }: { item: TwitterTweet }) => (
    <View style={styles.tweetContainer}>
      <View style={styles.tweetHeader}>
        <Image 
          source={{ uri: item.author.profileImageUrl }} 
          style={styles.profileImage}
        />
        <View style={styles.tweetInfo}>
          <Text style={styles.displayName}>{item.author.displayName}</Text>
          <Text style={styles.username}>@{item.author.username}</Text>
        </View>
        <Text style={styles.tweetDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.tweetText}>{item.text}</Text>
      
      {item.hashtags.length > 0 && (
        <View style={styles.hashtagsContainer}>
          {item.hashtags.map((tag, index) => (
            <Text key={index} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.tweetActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikeTweet(item.id)}
        >
          <Text style={styles.actionText}>❤️ {item.likeCount}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRetweet(item.id)}
        >
          <Text style={styles.actionText}>🔄 {item.retweetCount}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>💬 {item.replyCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDirectMessage = ({ item }: { item: TwitterDirectMessage }) => (
    <View style={styles.dmContainer}>
      <View style={styles.dmHeader}>
        <Image 
          source={{ uri: item.sender.profileImageUrl }} 
          style={styles.profileImage}
        />
        <View style={styles.dmInfo}>
          <Text style={styles.displayName}>{item.sender.displayName}</Text>
          <Text style={styles.username}>@{item.sender.username}</Text>
        </View>
        <Text style={styles.dmDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      
      <Text style={styles.dmText}>{item.text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐦 Twitter Integration</Text>
        <Text style={styles.subtitle}>Manage your Twitter account and tweets</Text>
      </View>

      {/* OAuth Setup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔐 OAuth Setup</Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowOAuthSetup(!showOAuthSetup)}
          >
            <Text style={styles.toggleButtonText}>
              {showOAuthSetup ? 'Hide' : 'Show'} Setup
            </Text>
          </TouchableOpacity>
        </View>

        {showOAuthSetup && (
          <View style={styles.oauthForm}>
            <TextInput
              style={styles.input}
              placeholder="Twitter Client ID"
              value={clientId}
              onChangeText={setClientId}
            />
            <TextInput
              style={styles.input}
              placeholder="Twitter Client Secret"
              value={clientSecret}
              onChangeText={setClientSecret}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Authorization Code"
              value={authCode}
              onChangeText={setAuthCode}
            />
            <TextInput
              style={styles.input}
              placeholder="Code Verifier (optional)"
              value={codeVerifier}
              onChangeText={setCodeVerifier}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handleOAuthSetup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Generate Auth URL</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={handleTokenExchange}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Complete Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Account Info Section */}
      {accountInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account Information</Text>
          <View style={styles.accountCard}>
            <Image 
              source={{ uri: accountInfo.profileImageUrl }} 
              style={styles.accountImage}
            />
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{accountInfo.displayName}</Text>
              <Text style={styles.accountUsername}>@{accountInfo.username}</Text>
              <Text style={styles.accountDescription}>{accountInfo.description}</Text>
              <View style={styles.accountStats}>
                <Text style={styles.stat}>📊 {accountInfo.followersCount} Followers</Text>
                <Text style={styles.stat}>📈 {accountInfo.followingCount} Following</Text>
                <Text style={styles.stat}>🐦 {accountInfo.tweetsCount} Tweets</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowTweetComposer(true)}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionTitle}>Compose Tweet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowSearch(true)}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionTitle}>Search Tweets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowDMs(!showDMs)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionTitle}>Direct Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={loadTweets}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionTitle}>Refresh Tweets</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tweet Composer */}
      {showTweetComposer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✏️ Compose Tweet</Text>
          <View style={styles.composerContainer}>
            <TextInput
              style={styles.tweetInput}
              placeholder="What's happening?"
              value={newTweetText}
              onChangeText={setNewTweetText}
              multiline
              maxLength={280}
            />
            <Text style={styles.charCount}>{newTweetText.length}/280</Text>
            <View style={styles.composerActions}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowTweetComposer(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handlePostTweet}
                disabled={loading || !newTweetText.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Post Tweet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Search Tweets */}
      {showSearch && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Search Tweets</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter search query..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.searchActions}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowSearch(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handleSearchTweets}
                disabled={loading || !searchQuery.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Tweets Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐦 Recent Tweets</Text>
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : (
          <FlatList
            data={tweets}
            renderItem={renderTweet}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Direct Messages Section */}
      {showDMs && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Direct Messages</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={loadDirectMessages}
          >
            <Text style={styles.buttonText}>Load DMs</Text>
          </TouchableOpacity>
          {directMessages.length > 0 && (
            <FlatList
              data={directMessages}
              renderItem={renderDirectMessage}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {/* Test Connection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Test Connection</Text>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]}
          onPress={async () => {
            if (!credentials) return;
            const response = await TwitterService.testConnection(credentials);
            Alert.alert(
              'Connection Test',
              response.success ? '✅ Connection successful!' : '❌ Connection failed!'
            );
          }}
        >
          <Text style={styles.buttonText}>Test Twitter Connection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1DA1F2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  oauthForm: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#1DA1F2',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  accountUsername: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  accountDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  accountStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 12,
    color: '#666',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  composerContainer: {
    marginTop: 10,
  },
  tweetInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchContainer: {
    marginTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  searchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tweetContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  tweetInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  tweetDate: {
    fontSize: 12,
    color: '#999',
  },
  tweetText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  hashtag: {
    color: '#1DA1F2',
    marginRight: 10,
    fontSize: 14,
  },
  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  dmContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dmInfo: {
    flex: 1,
  },
  dmDate: {
    fontSize: 12,
    color: '#999',
  },
  dmText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  loader: {
    marginVertical: 20,
  },
});

export default TwitterScreen; 