import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { createPost } from '@/services/postService';
import { useAuthStore } from '@/store/authStore';

const MAX_LENGTH = 500;

export default function CreatePostScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const handleSubmit = async () => {
    setError('');
    const text = content.trim();
    if (!text) {
      setError('Write something to post.');
      return;
    }
    if (text.length > MAX_LENGTH) {
      setError(`Post must be under ${MAX_LENGTH} characters.`);
      return;
    }
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }
    setLoading(true);
    try {
      await createPost(text);
      setContent('');
      router.replace('/(tabs)/feed');
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status;
      if (status === 401) {
        await logout();
        router.replace('/(auth)/login');
        return;
      }
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to create post';
      setError(msg || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>What's on your mind?</Text>
        <TextInput
          style={styles.input}
          placeholder="Share a post..."
          placeholderTextColor="#666"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={MAX_LENGTH + 50}
        />
        <View style={styles.footer}>
          <Text style={styles.charCount}>
            {content.length} / {MAX_LENGTH}
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b2e',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  label: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 160,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 24,
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
