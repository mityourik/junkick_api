import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { Session } from '../models/Session.model';
import { generateToken, authenticateToken } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/error';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw createError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateToken(user);

  await Session.create({
    userId: user._id,
    type: 'login'
  });

  const userResponse = await User.findById(user._id).select('-passwordHash');

  res.json({
    user: userResponse,
    accessToken
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) {
    await Session.create({
      userId: req.user._id,
      type: 'logout'
    });
  }

  res.status(204).send();
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
  }

  res.json({
    user: req.user
  });
});
