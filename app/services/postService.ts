import { api } from './api';

export interface Author {
  _id: string;
  username: string;
  email: string;
}

export interface Comment {
  _id?: string;
  user: Author;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: Author;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface GetPostsResponse {
  posts: Post[];
  page: number;
  pages: number;
  total: number;
}

export async function fetchPosts(page = 1, limit = 10): Promise<GetPostsResponse> {
  const { data } = await api.get<GetPostsResponse>('/posts', {
    params: { page, limit },
  });
  return data;
}

export async function createPost(content: string): Promise<Post> {
  const { data } = await api.post<Post>('/posts', { content });
  return data;
}

export async function likePost(postId: string): Promise<{ message: string; likesCount: number }> {
  const { data } = await api.post<{ message: string; likesCount: number }>(
    `/posts/${postId}/like`
  );
  return data;
}

export async function commentOnPost(postId: string, text: string): Promise<Comment> {
  const { data } = await api.post<Comment>(`/posts/${postId}/comment`, { text });
  return data;
}

export async function fetchPostById(postId: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${postId}`);
  return data;
}
