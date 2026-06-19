const mongoose = require('mongoose');

// Try to connect
mongoose.connect('mongodb://localhost:27017/myshop')
  .then(() => {
    console.log('✅ MongoDB Connected!');
    console.log('Connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });