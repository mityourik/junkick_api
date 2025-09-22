import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

import { config } from '../src/config';
import { User } from '../src/models/User.model';
import { Project } from '../src/models/Project.model';
import { Application } from '../src/models/Application.model';
import { Role } from '../src/models/Role.model';
import { Technology } from '../src/models/Technology.model';
import { Category } from '../src/models/Category.model';

interface LegacyData {
  users: any[];
  projects: any[];
  applications: any[];
  roles: any[];
  technologies: any[];
  categories: any[];
}

const migrateData = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Подключен к MongoDB');

    // Чтение файла db.json
    const dbPath = path.join(__dirname, '../db.json');
    
    if (!fs.existsSync(dbPath)) {
      console.error('❌ Файл db.json не найден');
      process.exit(1);
    }

    const dbData: LegacyData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('📁 Данные из db.json загружены');

    // Очистка существующих коллекций
    await User.deleteMany({});
    await Project.deleteMany({});
    await Application.deleteMany({});
    await Role.deleteMany({});
    await Technology.deleteMany({});
    await Category.deleteMany({});
    console.log('🧹 Существующие данные очищены');

    // Миграция словарей
    console.log('📚 Миграция словарей...');
    
    // Роли
    const rolesData = dbData.roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      variant: role.variant,
      color: role.color
    }));
    await Role.insertMany(rolesData);
    console.log(`✅ Импортировано ${rolesData.length} ролей`);

    // Технологии
    const technologiesData = dbData.technologies.map(tech => ({
      id: tech.id,
      name: tech.name,
      category: tech.category,
      icon: tech.icon,
      color: tech.color
    }));
    await Technology.insertMany(technologiesData);
    console.log(`✅ Импортировано ${technologiesData.length} технологий`);

    // Категории
    const categoriesData = dbData.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      color: cat.color
    }));
    await Category.insertMany(categoriesData);
    console.log(`✅ Импортировано ${categoriesData.length} категорий`);

    // Миграция пользователей
    console.log('👥 Миграция пользователей...');
    const userMap = new Map<string, string>(); // oldId -> newId

    for (const user of dbData.users) {
      // Хэшируем пароль
      const passwordHash = await bcrypt.hash(user.password || 'defaultPassword123', 12);
      
      const newUser = new User({
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role || 'разработчик',
        avatar: user.avatar,
        skills: user.skills || '',
        bio: user.bio,
        experience: parseInt(user.experience) || 0,
        location: user.location,
        portfolio: user.portfolio
      });

      const savedUser = await newUser.save();
      userMap.set(user.id, savedUser._id.toString());
    }
    console.log(`✅ Импортировано ${dbData.users.length} пользователей`);

    // Миграция проектов
    console.log('🚀 Миграция проектов...');
    const projectMap = new Map<string, string>(); // oldId -> newId

    for (const project of dbData.projects) {
      const ownerId = userMap.get(project.ownerId);
      if (!ownerId) {
        console.warn(`⚠️  Пропущен проект ${project.name}: владелец не найден`);
        continue;
      }

      // Маппинг участников команды
      const teamMembers = [];
      if (project.teamMembers && Array.isArray(project.teamMembers)) {
        for (const memberId of project.teamMembers) {
          const mappedMemberId = userMap.get(memberId);
          if (mappedMemberId) {
            teamMembers.push(mappedMemberId);
          }
        }
      }

      const newProject = new Project({
        name: project.name,
        description: project.description,
        status: project.status || 'в поиске команды',
        lookingFor: project.lookingFor || '',
        category: project.category,
        tech: project.tech || [],
        neededRoles: project.neededRoles || [],
        teamSize: parseInt(project.teamSize) || 1,
        currentTeam: teamMembers.length + 1, // +1 для владельца
        budget: project.budget || '',
        timeline: project.timeline || '',
        complexity: project.complexity || 'средний',
        image: project.image || '',
        features: project.features || [],
        requirements: project.requirements || [],
        ownerId,
        teamMembers
      });

      const savedProject = await newProject.save();
      projectMap.set(project.id, savedProject._id.toString());
    }
    console.log(`✅ Импортировано ${dbData.projects.length} проектов`);

    // Миграция заявок
    console.log('📝 Миграция заявок...');
    let importedApplications = 0;

    for (const application of dbData.applications) {
      const projectId = projectMap.get(application.projectId);
      if (!projectId) {
        console.warn(`⚠️  Пропущена заявка: проект не найден`);
        continue;
      }

      // Пытаемся найти пользователя по имени или оставляем пустым
      let userId = undefined;
      if (application.userId) {
        userId = userMap.get(application.userId);
      }

      const newApplication = new Application({
        projectId,
        userId,
        name: application.name || 'Аноним',
        role: application.role || '',
        message: application.message || '',
        status: application.status || 'new'
      });

      await newApplication.save();
      importedApplications++;
    }
    console.log(`✅ Импортировано ${importedApplications} заявок`);

    console.log('\n🎉 Миграция завершена успешно!');
    console.log(`📊 Статистика:`);
    console.log(`   👥 Пользователи: ${dbData.users.length}`);
    console.log(`   🚀 Проекты: ${dbData.projects.length}`);
    console.log(`   📝 Заявки: ${importedApplications}`);
    console.log(`   📚 Роли: ${rolesData.length}`);
    console.log(`   💻 Технологии: ${technologiesData.length}`);
    console.log(`   📂 Категории: ${categoriesData.length}`);

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Соединение с MongoDB закрыто');
    process.exit(0);
  }
};

// Запуск миграции
if (require.main === module) {
  migrateData();
}

export default migrateData;
