const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API VERCEL OK' });
});

app.use('/api/auth', require('../routes/auth'));
app.use('/api/products', require('../routes/products'));

module.exports = app;
