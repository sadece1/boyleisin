import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  incrementViews,
  getFeaturedPosts,
  getRecommendedPosts,
  searchBlogPosts,
  getBlogCategories,
} from '../services/blogService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await getBlogPosts(req.query);
  res.status(200).json({
    success: true,
    data: result.data.map((p: any) => ({
      ...p,
      created_at: parseDate(p.created_at),
      updated_at: parseDate(p.updated_at),
    })),
    pagination: result.pagination,
  });
});

export const getSinglePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await getBlogPostById(id);
  if (!post) {
    res.status(404).json({ success: false, message: 'Blog post not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      ...post,
      created_at: parseDate(post.created_at),
      updated_at: parseDate(post.updated_at),
    },
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const post = await createBlogPost(req.body);
  res.status(201).json({
    success: true,
    message: 'Blog post created successfully',
    data: {
      ...post,
      created_at: parseDate(post.created_at),
      updated_at: parseDate(post.updated_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const post = await updateBlogPost(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Blog post updated successfully',
    data: {
      ...post,
      created_at: parseDate(post.created_at),
      updated_at: parseDate(post.updated_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteBlogPost(id);
  res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
});

export const incrementPostViews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await incrementViews(id);
  res.status(200).json({ success: true, message: 'View count updated' });
});

export const getFeatured = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const posts = await getFeaturedPosts(limit);
  res.status(200).json({
    success: true,
    data: posts.map((p: any) => ({
      ...p,
      created_at: parseDate(p.created_at),
      updated_at: parseDate(p.updated_at),
    })),
  });
});

export const getRecommended = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const posts = await getRecommendedPosts(id);
  res.status(200).json({
    success: true,
    data: posts.map((p: any) => ({
      ...p,
      created_at: parseDate(p.created_at),
      updated_at: parseDate(p.updated_at),
    })),
  });
});

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    res.status(400).json({ success: false, message: 'Search query is required' });
    return;
  }
  const posts = await searchBlogPosts(q);
  res.status(200).json({
    success: true,
    data: posts.map((p: any) => ({
      ...p,
      created_at: parseDate(p.created_at),
      updated_at: parseDate(p.updated_at),
    })),
  });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await getBlogCategories();
  res.status(200).json({ success: true, data: categories });
});













