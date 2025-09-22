import mongoose from 'mongoose';
import { config } from '../config';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ MongoDB подключен успешно');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
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
