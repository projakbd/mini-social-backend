import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Post, Comment as CommentType } from '@/services/postService';

interface CommentModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSubmitComment: (text: string) => Promise<void>;
  loading?: boolean;
}

export function CommentModal({
  visible,
  post,
  onClose,
  onSubmitComment,
  loading = false,
}: CommentModalProps) {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const t = text.trim();
    if (!t || !post) return;
    setSubmitting(true);
    try {
      await onSubmitComment(t);
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  const comments = post?.comments ?? [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, isTablet && styles.overlayTablet]}
      >
        <View style={[styles.sheet, isTablet && styles.sheetTablet]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <TouchableOpacity onPress={onClose} hitSlop={16}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator style={styles.loader} color="#6c5ce7" />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item, i) => (item._id ?? i.toString())}
              renderItem={({ item }: { item: CommentType }) => (
                <View style={styles.commentRow}>
                  <Text style={styles.commentAuthor}>
                    {(item.user as { name?: string })?.name ?? 'User'}
                  </Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <Text style={styles.commentTime}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ''}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No comments yet.</Text>
              }
              style={styles.list}
            />
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendDisabled]}
              onPress={handleSubmit}
              disabled={!text.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: '#1a1b2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  sheetTablet: {
    borderRadius: 20,
    width: 600,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  loader: {
    marginVertical: 40,
  },
  list: {
    maxHeight: 320,
  },
  commentRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  commentAuthor: {
    color: '#6c5ce7',
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    color: '#e0e0e0',
    fontSize: 14,
  },
  commentTime: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    padding: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
