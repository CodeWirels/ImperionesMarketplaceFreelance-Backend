const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Purchase = require('./Purchase');

// Definir relaciones
User.hasMany(Purchase, { foreignKey: 'userId' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Purchase, { foreignKey: 'productId' });
Purchase.belongsTo(Product, { foreignKey: 'productId' });

// Sincronizar modelos con la base de datos
const syncDatabase = async () => {
    try {
        console.log('🔄 Autenticando conexión a Neon...');
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL Neon exitosa');
        
        console.log('🔄 Sincronizando modelos...');
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada');
        
        return true;
    } catch (error) {
        console.error('❌ Error sincronizando BD:', error.message);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    Product,
    Purchase,
    syncDatabase
};