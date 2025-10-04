import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { createError, asyncHandler } from '../middleware/error';

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-passwordHash');
  if (!user) {
    throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
  }

  res.json({
    user
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  delete updateData.email;
  delete updateData.passwordHash;
  delete updateData._id;
  delete updateData.createdAt;

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!user) {
    throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
  }

  res.json({
    user
  });
});
