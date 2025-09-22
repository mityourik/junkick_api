import { Request, Response } from 'express';
import { Project } from '../models/Project.model';
import { User } from '../models/User.model';
import { createError, asyncHandler } from '../middleware/error';

// GET /projects
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const {
    q,
    category,
    status,
    ownerId,
    neededRoles,
    tech,
    page = '1',
    limit = '20',
    sort = '-createdAt'
  } = req.query;

  // Построение фильтра
  const filter: any = {};

  // Текстовый поиск
  if (q) {
    filter.$text = { $search: q as string };
  }

  // Фильтр по категории
  if (category) {
    filter.category = category;
  }

  // Фильтр по статусу
  if (status) {
    filter.status = status;
  }

  // Фильтр по владельцу
  if (ownerId) {
    filter.ownerId = ownerId;
  }

  // Фильтр по нужным ролям
  if (neededRoles) {
    filter.neededRoles = { $in: (neededRoles as string).split(',') };
  }

  // Фильтр по технологиям
  if (tech) {
    filter.tech = { $in: (tech as string).split(',') };
  }

  // Настройка пагинации
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Настройка сортировки
  const sortOptions: any = {};
  const sortStr = Array.isArray(sort) ? sort[0] : sort;
  if (typeof sortStr === 'string') {
    if (sortStr.startsWith('-')) {
      sortOptions[sortStr.substring(1)] = -1;
    } else {
      sortOptions[sortStr] = 1;
    }
  }

  // Если используется текстовый поиск, добавляем сортировку по релевантности
  if (q) {
    sortOptions.score = { $meta: 'textScore' };
  }

  // Выполнение запроса
  const projects = await Project.find(filter)
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // Подсчет общего количества
  const total = await Project.countDocuments(filter);

  res.json({
    projects,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// GET /projects/:id
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate('ownerId', 'name email avatar skills experience')
    .populate('teamMembers', 'name email avatar skills experience');

  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  res.json({
    project
  });
});

// POST /projects
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Требуется аутентификация', 401, 'AUTHENTICATION_REQUIRED');
  }

  const projectData = {
    ...req.body,
    ownerId: req.user._id,
    currentTeam: 1,
    teamMembers: [req.user._id]
  };

  const project = await Project.create(projectData);
  
  const populatedProject = await Project.findById(project._id)
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.status(201).json({
    project: populatedProject
  });
});

// PATCH /projects/:id
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Удаляем поля, которые нельзя обновлять напрямую
  delete updateData._id;
  delete updateData.ownerId;
  delete updateData.createdAt;
  delete updateData.currentTeam;
  delete updateData.teamMembers;

  const project = await Project.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  res.json({
    project
  });
});

// DELETE /projects/:id
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  res.status(204).send();
});

// POST /projects/:id/team
export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  // Проверяем существование пользователя
  const user = await User.findById(userId);
  if (!user) {
    throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
  }

  const project = await Project.findById(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  // Проверяем, не является ли пользователь уже участником
  if (project.teamMembers.includes(userId)) {
    throw createError('Пользователь уже является участником проекта', 409, 'USER_ALREADY_MEMBER');
  }

  // Проверяем, не превышает ли добавление максимальный размер команды
  if (project.currentTeam >= project.teamSize) {
    throw createError('Команда уже достигла максимального размера', 400, 'TEAM_SIZE_EXCEEDED');
  }

  // Добавляем пользователя в команду
  project.teamMembers.push(userId);
  project.currentTeam += 1;
  await project.save();

  const updatedProject = await Project.findById(id)
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.json({
    project: updatedProject
  });
});

// DELETE /projects/:id/team/:userId
export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { id, userId } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  // Проверяем, что пользователь является участником команды
  const memberIndex = project.teamMembers.findIndex(memberId => memberId.toString() === userId);
  if (memberIndex === -1) {
    throw createError('Пользователь не является участником команды', 404, 'USER_NOT_MEMBER');
  }

  // Нельзя удалить владельца проекта
  if (project.ownerId.toString() === userId) {
    throw createError('Нельзя удалить владельца проекта', 400, 'CANNOT_REMOVE_OWNER');
  }

  // Удаляем пользователя из команды
  project.teamMembers.splice(memberIndex, 1);
  project.currentTeam -= 1;
  await project.save();

  const updatedProject = await Project.findById(id)
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar');

  res.json({
    project: updatedProject
  });
});
