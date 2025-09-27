import mongoose from 'mongoose';
import { config } from '../config';

const connectDB = async (): Promise<void> => {
  try {
    const options = {
      // Настройки для стабильности соединения
      maxPoolSize: 10, // Максимальное количество соединений в пуле
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      socketTimeoutMS: 45000, // Таймаут сокета
      // Удалены устаревшие опции useNewUrlParser, useUnifiedTopology, bufferMaxEntries, bufferCommands
    };

    await mongoose.connect(config.mongodb.uri, options);
    console.log('✅ MongoDB Atlas подключен успешно');
    console.log(`📍 Подключение к: ${config.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`);
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB Atlas:', error);
    console.error('🔍 Проверьте:');
    console.error('   - Правильность URI подключения');
    console.error('   - Доступность интернета');
    console.error('   - Настройки firewall');
    console.error('   - IP адреса в whitelist MongoDB Atlas');
    process.exit(1);
  }
};

// Обработка событий подключения
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose подключен к MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Ошибка Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose отключен от MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB соединение закрыто через app termination');
  process.exit(0);
});

export default connectDB;
