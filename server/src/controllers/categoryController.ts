import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await getCategories();
  res.status(200).json({
    success: true,
    data: categories.map((c: any) => ({
      ...c,
      created_at: parseDate(c.created_at),
      updated_at: parseDate(c.updated_at),
    })),
  });
});

export const getTree = asyncHandler(async (req: Request, res: Response) => {
  const tree = await getCategoryTree();
  res.status(200).json({ success: true, data: tree });
});

export const getSingleCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await getCategoryById(id);
  if (!category) {
    res.status(404).json({ success: false, message: 'Category not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      ...category,
      created_at: parseDate(category.created_at),
      updated_at: parseDate(category.updated_at),
    },
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await createCategory(req.body);
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: {
      ...category,
      created_at: parseDate(category.created_at),
      updated_at: parseDate(category.updated_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const category = await updateCategory(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: {
      ...category,
      created_at: parseDate(category.created_at),
      updated_at: parseDate(category.updated_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteCategory(id);
  res.status(200).json({ success: true, message: 'Category deleted successfully' });
});













