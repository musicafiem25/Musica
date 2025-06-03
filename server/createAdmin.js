require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User'); // adjust if your path is different

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'musicafiemmca@gmail.com',
      password: hashedPassword,
      isAdmin: true,
    });
    console.log("✅ Admin user created");
    console.log("Hashed password:", hashedPassword);
    process.exit();
  })
  .catch(err => {
    console.error("❌ Failed to connect or create admin:", err);
    process.exit(1);
  });
