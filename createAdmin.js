const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./server/models/User');

const createAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 

    console.log('✅ Connected to MongoDB Atlas');

    const existingAdmin = await User.findOne({ email: 'admin@konkanproperties.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email: admin@konkanproperties.com');
      console.log('👤 Role: Administrator');
    } else {
      const admin = new User({
        name: 'Super Administrator',
        email: 'admin@konkanproperties.com',
        password: 'admin123',
        phone: '+91-9876543210',
        address: 'Konkan Coast, Maharashtra, India',
        isVerified: true
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@konkanproperties.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: Administrator');
      console.log('⚠️  IMPORTANT: Change the password after first login!');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit();
  }
};

createAdmin();