import { Request, Response } from 'express';
import { searchCampsites } from '../services/campsiteService';
import { searchGear } from '../services/gearService';
import { searchBlogPosts } from '../services/blogService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({ success: false, message: 'Search query is required' });
    return;
  }

  const [campsites, gear, blogPosts] = await Promise.all([
    searchCampsites(q, 5),
    searchGear(q, 5),
    searchBlogPosts(q, 5),
  ]);

  res.status(200).json({
    success: true,
    data: {
      campsites: campsites.map((c: any) => ({
        ...c,
        created_at: parseDate(c.created_at),
        updated_at: parseDate(c.updated_at),
      })),
      gear: gear.map((g: any) => ({
        ...g,
        created_at: parseDate(g.created_at),
        updated_at: parseDate(g.updated_at),
      })),
      blogPosts: blogPosts.map((p: any) => ({
        ...p,
        created_at: parseDate(p.created_at),
        updated_at: parseDate(p.updated_at),
      })),
    },
  });
});

export const searchBlogs = asyncHandler(async (req: Request, res: Response) => {
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

export const searchGearItems = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    res.status(400).json({ success: false, message: 'Search query is required' });
    return;
  }
  const gear = await searchGear(q);
  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});

export const searchCampsitesOnly = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    res.status(400).json({ success: false, message: 'Search query is required' });
    return;
  }
  const campsites = await searchCampsites(q);
  res.status(200).json({
    success: true,
    data: campsites.map((c: any) => ({
      ...c,
      created_at: parseDate(c.created_at),
      updated_at: parseDate(c.updated_at),
    })),
  });
});













