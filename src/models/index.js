
const express = require('express');
const cors = require('cors');

const app = express();

/* ======================
   MIDDLEWARE
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   ROUTES
====================== */
app.get('/', (req, res) => {
  res.json({ message: 'Imperiones API (Vercel)' });
});

/* 
   IMPORTANTE:
   estamos en /api
   para llegar a src → ../src
*/
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/products', require('../src/routes/products'));

module.exports = app;
