const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ======================
// 🔹 MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  next();
});

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================
// 🔹 ROUTES
// ======================
app.use('/api/events', require('./routes/events'));
app.use('/api/register', require('./routes/register'));
app.use('/api/company', require('./routes/company'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/internships', require('./routes/internships'));

// ======================
// 🔹 HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok 🚀' });
});

// ======================
// 🔹 404 HANDLER
// ======================
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// ======================
// 🔹 MONGODB CONNECT
// ======================

// ⚠️ Change password immediately (security)
const MONGO_URI = "mongodb+srv://SproutsOrgs:SproutsOrgs12345@cluster0.1i9dtge.mongodb.net/sprouts?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI); // ✅ fixed (no options)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  }
};

// ======================
// 🔹 START SERVER
// ======================
const PORT = process.env.PORT || 5000; // ✅ important for Render

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});