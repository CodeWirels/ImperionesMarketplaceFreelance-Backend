const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* ======================
   CORS
====================== */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://portafolio2-xi.vercel.app',
    'https://portafolio2-verhcks-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ======================
   BODY PARSER
====================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   RUTA BASE
====================== */
app.get('/', (req, res) => {
  res.json({
    message: '✅ Imperiones API funcionando (Vercel)',
    timestamp: new Date()
  });
});

/* ======================
   HEALTH CHECK (SIN SYNC)
====================== */
app.get('/api/health', async (req, res) => {
  try {
    const { sequelize } = require('../models');

    await sequelize.authenticate();

    res.json({
      status: 'OK',
      database: 'Conectado ✅',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Health error:', error.message);
    res.status(500).json({
      status: 'ERROR',
      database: 'Desconectado ❌',
      error: error.message
    });
  }
});

/* ======================
   USERS
====================== */
app.get('/api/users', async (req, res) => {
  try {
    const { User } = require('../models');

    const users = await User.findAll({
      attributes: ['id', 'email', 'fullName', 'createdAt'],
      order: [['id', 'ASC']]
    });

    res.json({
      total: users.length,
      users
    });
  } catch (error) {
    console.error('❌ Users error:', error.message);
    res.status(500).json({
      error: 'Error al obtener usuarios',
      details: error.message
    });
  }
});

/* ======================
   ROUTES
====================== */
app.use('/api/auth', require('../routes/auth'));
app.use('/api/products', require('../routes/products'));

/* ======================
   ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

/* ======================
   EXPORT SERVERLESS
====================== */
module.exports = app;
