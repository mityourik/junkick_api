import mongoose from 'mongoose';
import { config } from '../config';

const connectDB = async (): Promise<void> => {
  try {
    const isDevelopment = config.nodeEnv === 'development';

    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true,
      ...(isDevelopment && {
        autoIndex: true,
        autoCreate: true
      }),
      ...(!isDevelopment && {
        autoIndex: false,
        autoCreate: false
      })
    };

    await mongoose.connect(config.mongodb.uri, connectionOptions);

    console.log('MongoDB подключен успешно');
    console.log(`База данных: ${mongoose.connection.db?.databaseName}`);
    console.log(`Окружение: ${config.nodeEnv}`);
    console.log(`URI: ${config.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`);
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose подключен к MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Ошибка Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose отключен от MongoDB');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB соединение закрыто через app termination');
  process.exit(0);
});

export default connectDB;
