const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
    try {
        // Obtener token del header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ 
                error: 'Token no proporcionado' 
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar usuario
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ 
                error: 'Usuario no encontrado' 
            });
        }

        // Añadir usuario al request
        req.user = user;
        next();

    } catch (error) {
        return res.status(403).json({ 
            error: 'Token inválido o expirado' 
        });
    }
};

module.exports = { authenticateToken };
