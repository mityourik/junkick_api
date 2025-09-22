import { Request, Response } from 'express';
import { Application } from '../models/Application.model';
import { Project } from '../models/Project.model';
import { createError, asyncHandler } from '../middleware/error';

// POST /applications
export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, name, role, message } = req.body;

  // Проверяем существование проекта
  const project = await Project.findById(projectId);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  // Если пользователь авторизован, используем его данные
  let userId = undefined;
  let applicantName = name;

  if (req.user) {
    userId = req.user._id;
    applicantName = req.user.name;
  }

  // Создаем заявку
  const application = await Application.create({
    projectId,
    userId,
    name: applicantName,
    role,
    message
  });

  const populatedApplication = await Application.findById(application._id)
    .populate('projectId', 'name ownerId')
    .populate('userId', 'name email');

  res.status(201).json({
    application: populatedApplication
  });
});

// GET /projects/:id/applications
export const getProjectApplications = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Проверяем существование проекта
  const project = await Project.findById(id);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  // Получаем заявки для проекта
  const applications = await Application.find({ projectId: id })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json({
    applications
  });
});

// PATCH /applications/:id
export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const application = await Application.findById(id);
  if (!application) {
    throw createError('Заявка не найдена', 404, 'APPLICATION_NOT_FOUND');
  }

  // Получаем проект для проверки прав доступа
  const project = await Project.findById(application.projectId);
  if (!project) {
    throw createError('Проект не найден', 404, 'PROJECT_NOT_FOUND');
  }

  // Проверяем права доступа (владелец проекта или админ)
  if (req.user?.role !== 'admin' && project.ownerId.toString() !== (req.user?._id as any)?.toString()) {
    throw createError('Нет прав для изменения статуса заявки', 403, 'APPLICATION_ACCESS_DENIED');
  }

  // Обновляем статус заявки
  application.status = status;
  await application.save();

  const updatedApplication = await Application.findById(id)
    .populate('projectId', 'name ownerId')
    .populate('userId', 'name email avatar');

  res.json({
    application: updatedApplication
  });
});

// GET /applications (для получения заявок пользователя)
export const getUserApplications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Требуется аутентификация', 401, 'AUTHENTICATION_REQUIRED');
  }

  const applications = await Application.find({ userId: req.user._id })
    .populate('projectId', 'name description status category')
    .sort({ createdAt: -1 });

  res.json({
    applications
  });
});
