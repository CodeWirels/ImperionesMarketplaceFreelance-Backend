require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: console.log, // Activar logs
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function testConnection() {
    try {
        console.log('🔄 Probando conexión a Neon...');
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa');
        
        const [results] = await sequelize.query('SELECT NOW()');
        console.log('⏰ Hora del servidor:', results[0].now);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testConnection();