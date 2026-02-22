import { useCallback, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { FilterBar } from '@/components/FilterBar';
import { PostCard } from '@/components/PostCard';
import { CommentModal } from '@/components/CommentModal';
import {
  fetchPosts,
  likePost,
  commentOnPost,
  type Post,
} from '@/services/postService';
import { POSTS_PAGE_SIZE } from '@/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function FeedScreen() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('');
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);

  const loadPage = useCallback(async (pageNum: number, append: boolean) => {
    if (!token) return;
    if (pageNum === 1) setRefreshing(true);
    else setLoadingMore(true);
    try {
      const res = await fetchPosts(pageNum, POSTS_PAGE_SIZE);
      setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
      setPages(res.pages);
      setPage(pageNum);
    } catch (e) {
      if ((e as { response?: { status: number } })?.response?.status === 401) {
        await logout();
        router.replace('/(auth)/login');
      }
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [token, logout]);

  const onRefresh = useCallback(() => loadPage(1, false), [loadPage]);
  const onEndReached = useCallback(() => {
    if (page < pages && !loadingMore) loadPage(page + 1, true);
  }, [page, pages, loadingMore, loadPage]);

  useEffect(() => {
    if (token) loadPage(1, false);
  }, [token]);

  const filteredPosts = filter.trim()
    ? posts.filter((p) => {
      const username = (p.author as { username?: string })?.username ?? '';
      return username.toLowerCase().includes(filter.trim().toLowerCase());
    })
    : posts;

  const handleLike = async (postId: string) => {
    if (!user) return;
    setLikingId(postId);
    try {
      await likePost(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const liked = p.likes.includes(user._id);
          const nextLikes = liked
            ? p.likes.filter((id) => id !== user._id)
            : [...p.likes, user._id];
          return { ...p, likes: nextLikes };
        })
      );
    } catch (_) { }
    finally {
      setLikingId(null);
    }
  };

  const handleCommentSubmit = async (text: string) => {
    if (!commentPost) return;
    try {
      const newComment = await commentOnPost(commentPost._id, text);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === commentPost._id
            ? { ...p, comments: [...(p.comments ?? []), newComment] }
            : p
        )
      );
      setCommentPost((prev) =>
        prev
          ? {
            ...prev,
            comments: [...(prev.comments ?? []), newComment],
          }
          : null
      );
    } catch (_) { }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>Hi, {user.username}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color="#888" />
        </TouchableOpacity>
      </View>
      <FilterBar value={filter} onChangeText={setFilter} />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUserId={user._id}
            onLike={() => handleLike(item._id)}
            onComment={() => setCommentPost(item)}
            onPress={() => router.push(`/post/${item._id}`)}
            isLiking={likingId === item._id}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6c5ce7"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footerLoader} color="#6c5ce7" />
          ) : null
        }
        ListEmptyComponent={
          !refreshing ? (
            <Text style={styles.empty}>
              {filter.trim() ? 'No posts match this username.' : 'No posts yet.'}
            </Text>
          ) : null
        }
      />
      <CommentModal
        visible={!!commentPost}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        onSubmitComment={handleCommentSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b2e',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  logoutBtn: {
    padding: 8,
  },
  footerLoader: {
    marginVertical: 16,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    padding: 32,
  },
});
