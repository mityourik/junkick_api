import { Request, Response } from 'express';
import { Project } from '../models/Project.model';
import { User } from '../models/User.model';
import { createError, asyncHandler } from '../middleware/error';

export const getProjectsByOwner = asyncHandler(async (req: Request, res: Response) => {
  const { ownerId } = req.params;

  if (!ownerId) {
    throw createError('ID владельца обязателен', 400, 'MISSING_OWNER_ID');
  }

  // Поддерживаем как числовые ID (старые данные), так и ObjectId (новые данные)
  const filter: any = {};
  
  // Проверяем, является ли ownerId числом
  if (!isNaN(Number(ownerId))) {
    // Пробуем и как число, и как строку
    filter.$or = [
      { ownerId: Number(ownerId) },
      { ownerId: ownerId }
    ];
  } else {
    // Если не число, используем как есть
    filter.ownerId = ownerId;
  }

  const projects = await Project.find(filter)
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar role')
    .sort({ createdAt: -1 });

  res.json(projects);
});

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

  const filter: any = {};

  if (q) {
    filter.$text = { $search: q as string };
  }

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (ownerId) {
    filter.ownerId = ownerId;
  }

  if (neededRoles) {
    filter.neededRoles = { $in: (neededRoles as string).split(',') };
  }

  if (tech) {
    filter.tech = { $in: (tech as string).split(',') };
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const sortOptions: any = {};
  const sortStr = Array.isArray(sort) ? sort[0] : sort;
  if (typeof sortStr === 'string') {
    if (sortStr.startsWith('-')) {
      sortOptions[sortStr.substring(1)] = -1;
    } else {
      sortOptions[sortStr] = 1;
    }
  }

  if (q) {
    sortOptions.score = { $meta: 'textScore' };
  }

  const projects = await Project.find(filter)
    .populate('ownerId', 'name email avatar')
    .populate('teamMembers', 'name email avatar')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

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

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

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

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  res.status(204).send();
});

export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw createError('Пользователь не найден', 404, 'USER_NOT_FOUND');
  }

  const project = await Project.findById(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  if (project.teamMembers.includes(userId)) {
    throw createError('Пользователь уже является участником проекта', 409, 'USER_ALREADY_MEMBER');
  }

  if (project.currentTeam >= project.teamSize) {
    throw createError('Команда уже достигла максимального размера', 400, 'TEAM_SIZE_EXCEEDED');
  }

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

export const removeTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const { id, userId } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  const memberIndex = project.teamMembers.findIndex(memberId => memberId.toString() === userId);
  if (memberIndex === -1) {
    throw createError('Пользователь не является участником команды', 404, 'USER_NOT_MEMBER');
  }

  if (project.ownerId.toString() === userId) {
    throw createError('Нельзя удалить владельца проекта', 400, 'CANNOT_REMOVE_OWNER');
  }

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
