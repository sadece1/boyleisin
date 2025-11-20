import pool from '../config/database';
import { BlogPost } from '../types';
import { generateId, parseJson, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get all blog posts with filters and pagination
 */
export const getBlogPosts = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  if (query.search) {
    conditions.push(`(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)`);
    const searchTerm = `%${query.search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  if (query.category) {
    conditions.push('category = ?');
    values.push(query.category);
  }

  if (query.featured !== undefined) {
    conditions.push('featured = ?');
    values.push(query.featured);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM blog_posts ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  const [posts] = await pool.execute<Array<any>>(
    `SELECT * FROM blog_posts ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  const parsedPosts = posts.map((p: any) => ({
    ...p,
    tags: parseJson<string[]>(p.tags) || [],
    recommended_posts: parseJson<string[]>(p.recommended_posts) || [],
  }));

  return {
    data: parsedPosts,
    pagination: formatPagination({ page, limit, total }),
  };
};

/**
 * Get single blog post by ID
 */
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const [posts] = await pool.execute<Array<any>>(
    'SELECT * FROM blog_posts WHERE id = ?',
    [id]
  );

  if (isEmpty(posts)) {
    return null;
  }

  const post = posts[0];
  return {
    ...post,
    tags: parseJson<string[]>(post.tags) || [],
    recommended_posts: parseJson<string[]>(post.recommended_posts) || [],
  };
};

/**
 * Create new blog post
 */
export const createBlogPost = async (data: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<BlogPost> => {
  const id = generateId();

  await pool.execute(
    `INSERT INTO blog_posts (
      id, title, excerpt, content, author, author_avatar,
      category, image, read_time, tags, featured, recommended_posts
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.excerpt,
      data.content,
      data.author,
      data.author_avatar || null,
      data.category,
      data.image,
      data.read_time,
      JSON.stringify(data.tags || []),
      data.featured ?? false,
      JSON.stringify(data.recommended_posts || []),
    ]
  );

  const post = await getBlogPostById(id);
  if (!post) {
    throw new AppError('Failed to create blog post', 500);
  }

  logger.info(`Blog post created: ${id}`);
  return post;
};

/**
 * Update blog post
 */
export const updateBlogPost = async (id: string, data: Partial<BlogPost>): Promise<BlogPost> => {
  const existing = await getBlogPostById(id);
  if (!existing) {
    throw new AppError('Blog post not found', 404);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.title) updateFields.push('title = ?'), updateValues.push(data.title);
  if (data.excerpt) updateFields.push('excerpt = ?'), updateValues.push(data.excerpt);
  if (data.content) updateFields.push('content = ?'), updateValues.push(data.content);
  if (data.author) updateFields.push('author = ?'), updateValues.push(data.author);
  if (data.author_avatar !== undefined) updateFields.push('author_avatar = ?'), updateValues.push(data.author_avatar);
  if (data.category) updateFields.push('category = ?'), updateValues.push(data.category);
  if (data.image) updateFields.push('image = ?'), updateValues.push(data.image);
  if (data.read_time !== undefined) updateFields.push('read_time = ?'), updateValues.push(data.read_time);
  if (data.tags) updateFields.push('tags = ?'), updateValues.push(JSON.stringify(data.tags));
  if (data.featured !== undefined) updateFields.push('featured = ?'), updateValues.push(data.featured);
  if (data.recommended_posts) updateFields.push('recommended_posts = ?'), updateValues.push(JSON.stringify(data.recommended_posts));

  if (updateFields.length === 0) return existing;

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(`UPDATE blog_posts SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

  const updated = await getBlogPostById(id);
  if (!updated) throw new AppError('Failed to update blog post', 500);

  logger.info(`Blog post updated: ${id}`);
  return updated;
};

/**
 * Delete blog post
 */
export const deleteBlogPost = async (id: string): Promise<void> => {
  const post = await getBlogPostById(id);
  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
  logger.info(`Blog post deleted: ${id}`);
};

/**
 * Increment blog post views
 */
export const incrementViews = async (id: string): Promise<void> => {
  await pool.execute('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [id]);
};

/**
 * Get featured blog posts
 */
export const getFeaturedPosts = async (limit: number = 5) => {
  const [posts] = await pool.execute<Array<any>>(
    'SELECT * FROM blog_posts WHERE featured = TRUE ORDER BY created_at DESC LIMIT ?',
    [limit]
  );

  return posts.map((p: any) => ({
    ...p,
    tags: parseJson<string[]>(p.tags) || [],
    recommended_posts: parseJson<string[]>(p.recommended_posts) || [],
  }));
};

/**
 * Get recommended posts for a blog post
 */
export const getRecommendedPosts = async (postId: string) => {
  const post = await getBlogPostById(postId);
  if (!post || !post.recommended_posts || post.recommended_posts.length === 0) {
    return [];
  }

  const placeholders = post.recommended_posts.map(() => '?').join(',');
  const [recommended] = await pool.execute<Array<any>>(
    `SELECT * FROM blog_posts WHERE id IN (${placeholders})`,
    post.recommended_posts
  );

  return recommended.map((p: any) => ({
    ...p,
    tags: parseJson<string[]>(p.tags) || [],
    recommended_posts: parseJson<string[]>(p.recommended_posts) || [],
  }));
};

/**
 * Search blog posts
 */
export const searchBlogPosts = async (searchTerm: string, limit: number = 10) => {
  const [posts] = await pool.execute<Array<any>>(
    `SELECT * FROM blog_posts 
     WHERE MATCH(title, excerpt, content) AGAINST(? IN NATURAL LANGUAGE MODE)
     OR title LIKE ? OR excerpt LIKE ?
     LIMIT ?`,
    [searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, limit]
  );

  return posts.map((p: any) => ({
    ...p,
    tags: parseJson<string[]>(p.tags) || [],
    recommended_posts: parseJson<string[]>(p.recommended_posts) || [],
  }));
};

/**
 * Get blog categories
 */
export const getBlogCategories = async () => {
  const [categories] = await pool.execute<Array<any>>(
    'SELECT DISTINCT category FROM blog_posts WHERE category IS NOT NULL ORDER BY category'
  );
  return categories.map((c) => c.category);
};













