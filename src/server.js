const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba simple (sin DB)
app.get('/', (req, res) => {
    res.json({ 
        message: '✅ Imperiones API funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date()
    });
});

// Ruta de salud MEJORADA con timeout
app.get('/api/health', async (req, res) => {
    try {
        const { sequelize } = require('./models');
        
        // Establecer timeout de 5 segundos
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de conexión')), 5000)
        );
        
        await Promise.race([
            sequelize.authenticate(),
            timeoutPromise
        ]);
        
        res.json({ 
            status: 'OK',
            database: 'Conectado ✅',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('❌ Error en /api/health:', error.message);
        res.status(500).json({ 
            status: 'ERROR',
            database: 'Desconectado ❌',
            error: error.message
        });
    }
});

// Ruta de usuarios
app.get('/api/users', async (req, res) => {
    try {
        const { User } = require('./models');
        const users = await User.findAll({
            attributes: ['id', 'email', 'fullName', 'createdAt'],
            order: [['id', 'ASC']]
        });
        
        res.json({ 
            total: users.length,
            users 
        });
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error.message);
        res.status(500).json({ 
            error: 'Error al obtener usuarios',
            details: error.message 
        });
    }
});

// Rutas de autenticación (SOLO UNA VEZ)
app.use('/api/auth', require('./routes/auth'));

// Rutas de productos
app.use('/api/products', require('./routes/products'));

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Función para iniciar el servidor CON sincronización de DB
async function startServer() {
    try {
        console.log('🔄 Iniciando sincronización de base de datos...');
        
        const { syncDatabase } = require('./models');
        await syncDatabase();
        
        console.log('✅ Base de datos sincronizada correctamente');
        
        // Iniciar servidor después de sincronizar
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📱 Acceso móvil: http://TU_IP:${PORT}`);
            console.log(`📡 Rutas disponibles:`);
            console.log(`   GET  http://localhost:${PORT}/`);
            console.log(`   GET  http://localhost:${PORT}/api/health`);
            console.log(`   GET  http://localhost:${PORT}/api/users`);
            console.log(`   GET  http://localhost:${PORT}/api/products`);
            console.log(`   POST http://localhost:${PORT}/api/auth/register`);
            console.log(`   POST http://localhost:${PORT}/api/auth/login`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar servidor
startServer();