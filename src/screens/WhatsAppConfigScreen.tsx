import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { WhatsAppConfig } from '../types';
import {
  createWhatsAppConfig,
  updateWhatsAppConfig,
  testWhatsAppConnection,
} from '../store/slices/whatsappSlice';

interface RouteParams {
  configId?: string;
}

export const WhatsAppConfigScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { configs, isLoading } = useSelector((state: RootState) => state.whatsapp);

  const params = route.params as RouteParams;
  const isEditing = !!params.configId;
  const existingConfig = isEditing ? configs.find(c => c.id === params.configId) : null;

  const [formData, setFormData] = useState<Partial<WhatsAppConfig>>({
    name: '',
    phoneNumber: '',
    apiKey: '',
    webhookUrl: '',
    isActive: true,
    syncInterval: 5,
    autoReply: false,
    autoReplyMessage: '',
  });

  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (existingConfig) {
      setFormData(existingConfig);
    }
  }, [existingConfig]);

  const handleInputChange = (field: keyof WhatsAppConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Configuration name is required');
      return false;
    }
    if (!formData.phoneNumber?.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    if (formData.autoReply && !formData.autoReplyMessage?.trim()) {
      Alert.alert('Error', 'Auto-reply message is required when auto-reply is enabled');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (isEditing && params.configId) {
        await dispatch(updateWhatsAppConfig({
          id: params.configId,
          config: formData,
        })).unwrap();
        Alert.alert('Success', 'Configuration updated successfully');
      } else {
        await dispatch(createWhatsAppConfig(formData as Omit<WhatsAppConfig, 'id'>)).unwrap();
        Alert.alert('Success', 'Configuration created successfully');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration');
    }
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsTesting(true);
    try {
      const result = await dispatch(testWhatsAppConnection(params.configId || 'new')).unwrap();
      Alert.alert(
        result.connected ? 'Connection Successful' : 'Connection Failed',
        result.message
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test connection');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Configuration' : 'New Configuration'}
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Configuration Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="e.g., Personal WhatsApp"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange('phoneNumber', text)}
            placeholder="+1234567890"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>API Key (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.apiKey}
            onChangeText={(text) => handleInputChange('apiKey', text)}
            placeholder="Enter your WhatsApp API key"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Webhook URL (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.webhookUrl}
            onChangeText={(text) => handleInputChange('webhookUrl', text)}
            placeholder="https://your-domain.com/webhook"
            placeholderTextColor="#9CA3AF"
            keyboardType="url"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sync Interval (minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.syncInterval?.toString()}
            onChangeText={(text) => handleInputChange('syncInterval', parseInt(text) || 5)}
            placeholder="5"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Active</Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) => handleInputChange('isActive', value)}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>Auto Reply</Text>
          <Switch
            value={formData.autoReply}
            onValueChange={(value) => handleInputChange('autoReply', value)}
            trackColor={{ false: '#E5E7EB', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {formData.autoReply && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Auto Reply Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.autoReplyMessage}
              onChangeText={(text) => handleInputChange('autoReplyMessage', text)}
              placeholder="Thanks for your message. I'll get back to you soon."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.testButton, isTesting && styles.testButtonDisabled]}
          onPress={handleTestConnection}
          disabled={isTesting}
        >
          {isTesting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="wifi" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>Test Connection</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 