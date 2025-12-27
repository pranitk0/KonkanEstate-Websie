const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    mongoose.connection.on('connected', () => {
      console.log('🗄️  Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    if (error.name === 'MongoNetworkError') {
      console.error('🔌 Network error: Could not connect to MongoDB Atlas');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('🔍 Server selection error: Could not find MongoDB server');
    } else if (error.name === 'MongoParseError') {
      console.error('📝 Connection string parse error: Check your MONGODB_URI format');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;