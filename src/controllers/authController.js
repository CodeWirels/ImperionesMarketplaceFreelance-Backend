const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generar JWT
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' } // Token válido por 7 días
    );
};

// REGISTRO
exports.register = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Validar datos
        if (!email || !password || !fullName) {
            return res.status(400).json({ 
                error: 'Nombre, email y contraseña son requeridos' 
            });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'El email ya está registrado' 
            });
        }

        // Crear usuario (el password se encripta automáticamente por el hook)
        const user = await User.create({
            email,
            password,
            fullName
        });

        // Generar token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            error: 'Error al registrar usuario' 
        });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email y contraseña son requeridos' 
            });
        }

        // Buscar usuario
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Verificar contraseña
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Credenciales inválidas' 
            });
        }

        // Generar token
        const token = generateToken(user.id);

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error al iniciar sesión' 
        });
    }
};

// OBTENER USUARIO ACTUAL
exports.getMe = async (req, res) => {
    try {
        // req.user viene del middleware authenticateToken
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.fullName,
                avatarUrl: req.user.avatarUrl,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ 
            error: 'Error al obtener usuario' 
        });
    }
};
