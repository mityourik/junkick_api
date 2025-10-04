import { Request, Response } from 'express';
import { Role } from '../models/Role.model';
import { Technology } from '../models/Technology.model';
import { Category } from '../models/Category.model';
import { asyncHandler } from '../middleware/error';

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await Role.find().sort({ name: 1 });
  res.json({
    roles
  });
});

export const getTechnologies = asyncHandler(async (req: Request, res: Response) => {
  const technologies = await Technology.find().sort({ category: 1, name: 1 });
  res.json({
    technologies
  });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({
    categories
  });
});
