import { useLocalSearchParams, router, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { Post, fetchPostById, likePost } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function PostDetailScreen() {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = useAuthStore((s) => s.user);
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [liking, setLiking] = useState(false);

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

    const handleLike = async () => {
        if (!user || !post) return;
        setLiking(true);
        try {
            await likePost(post._id);
            setPost((prev) => {
                if (!prev) return null;
                const liked = prev.likes.some(
                    (l) => (typeof l === 'string' ? l : l._id) === user._id
                );
                const nextLikes = liked
                    ? prev.likes.filter((l) => (typeof l === 'string' ? l : l._id) !== user._id)
                    : [...prev.likes, user._id];
                return { ...prev, likes: nextLikes };
            });
        } catch (_) { }
        finally {
            setLiking(false);
        }
    };

    const handleComment = () => {
        // Since we don't have the full comment modal logic here yet, 
        // we can navigate back to feed or just add a simple comment if we had the modal.
        // For now, let's just show an alert or navigate. 
        // Actually, let's just make it consistent with the card.
    };

    if (!user) return null;

    return (
        <View style={[styles.container, isTablet && styles.containerTablet]}>
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
                        onLike={handleLike}
                        onComment={() => { }}
                        isLiking={liking}
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
    containerTablet: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderLeftColor: '#16213e',
        borderRightColor: '#16213e',
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
