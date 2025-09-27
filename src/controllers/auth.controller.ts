import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Session } from '../models/Session.model';
import { generateToken, authenticateToken } from '../middleware/auth';
import { createError, asyncHandler } from '../middleware/error';

// POST /auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Поиск пользователя по email
  const user = await User.findOne({ email });
  if (!user) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Проверка пароля (в открытом виде)
  if (user.password !== password) {
    throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Возврат данных пользователя без пароля
  const { password: _, ...userResponse } = user.toObject();

  res.json(userResponse);
});

// POST /auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Если пользователь авторизован, создаем запись о выходе
  if (req.user) {
    await Session.create({
      userId: req.user._id,
      type: 'logout'
    });
  }

  res.status(204).send();
});

// GET /auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
  }

  res.json({
    user: req.user
  });
});
