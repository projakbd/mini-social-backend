import { useLocalSearchParams, router, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Post, fetchPostById } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = useAuthStore((s) => s.user);
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) loadPost();
    }, [id]);

    const loadPost = async () => {
        setLoading(true);
        try {
            const data = await fetchPostById(id as string);
            setPost(data);
        } catch (err) {
            setError('Could not load post. It might have been deleted.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Post Details', headerTintColor: '#fff', headerStyle: { backgroundColor: '#1a1b2e' } }} />
            <ScrollView contentContainerStyle={styles.scroll}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#6c5ce7" />
                    <Text style={styles.backText}>Back to Feed</Text>
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color="#6c5ce7" style={{ marginTop: 50 }} />
                ) : error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : post ? (
                    <PostCard
                        post={post}
                        currentUserId={user._id}
                        onLike={() => { /* Detail view like logic can be added here */ }}
                        onComment={() => { /* Detail view comment logic can be added here */ }}
                    />
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1b2e',
    },
    scroll: {
        paddingBottom: 40,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 8,
    },
    backText: {
        color: '#6c5ce7',
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: '#888',
        textAlign: 'center',
        padding: 40,
        fontSize: 16,
    },
});
