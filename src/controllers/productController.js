const { Product } = require('../models');
const { Op } = require('sequelize');

// LISTAR TODOS LOS PRODUCTOS
exports.getAllProducts = async (req, res) => {
    try {
        const { category, search, featured, page = 1, limit = 12 } = req.query;
        
        // Construir filtros
        const where = {};
        
        if (category) {
            where.category = category;
        }
        
        if (featured === 'true') {
            where.isFeatured = true;
        }
        
        if (search) {
            where.title = {
                [Op.iLike]: `%${search}%`
            };
        }
        
        // Paginación
        const offset = (page - 1) * limit;
        
        const { count, rows: products } = await Product.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            products
        });
        
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// OBTENER UN PRODUCTO POR ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ product });
        
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

// OBTENER UN PRODUCTO POR SLUG
exports.getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const product = await Product.findOne({ where: { slug } });
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ product });
        
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

// CREAR PRODUCTO (Solo admin - por ahora sin protección)
exports.createProduct = async (req, res) => {
    try {
        const {
            title,
            slug,
            description,
            price,
            category,
            demoUrl,
            fileUrl,
            thumbnailUrl,
            isFeatured
        } = req.body;
        
        // Validaciones básicas
        if (!title || !slug || !price) {
            return res.status(400).json({ 
                error: 'Título, slug y precio son requeridos' 
            });
        }
        
        // Verificar que el slug no exista
        const existingProduct = await Product.findOne({ where: { slug } });
        if (existingProduct) {
            return res.status(400).json({ 
                error: 'Ya existe un producto con ese slug' 
            });
        }
        
        const product = await Product.create({
            title,
            slug,
            description,
            price,
            category,
            demoUrl,
            fileUrl,
            thumbnailUrl,
            isFeatured: isFeatured || false
        });
        
        res.status(201).json({
            message: 'Producto creado exitosamente',
            product
        });
        
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

// ACTUALIZAR PRODUCTO
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Si se actualiza el slug, verificar que no exista
        if (updates.slug && updates.slug !== product.slug) {
            const existingProduct = await Product.findOne({ 
                where: { slug: updates.slug } 
            });
            if (existingProduct) {
                return res.status(400).json({ 
                    error: 'Ya existe un producto con ese slug' 
                });
            }
        }
        
        await product.update(updates);
        
        res.json({
            message: 'Producto actualizado exitosamente',
            product
        });
        
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

// ELIMINAR PRODUCTO
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        await product.destroy();
        
        res.json({
            message: 'Producto eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};

// OBTENER PRODUCTOS DESTACADOS (3 ALEATORIOS)
exports.getFeaturedProducts = async (req, res) => {
    try {
        const { sequelize } = require('../models');
        
        // Obtener 3 productos aleatorios
        const products = await Product.findAll({
            order: sequelize.random(),
            limit: 3
        });
        
        res.json({
            total: products.length,
            products
        });
        
    } catch (error) {
        console.error('Error obteniendo productos destacados:', error);
        res.status(500).json({ error: 'Error al obtener productos destacados' });
    }
};

// OBTENER CATEGORÍAS
exports.getCategories = async (req, res) => {
    try {
        const { sequelize } = require('../models');
        
        const [categories] = await sequelize.query(`
            SELECT 
                category,
                COUNT(*) as count
            FROM products
            WHERE category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC
        `);
        
        res.json({
            total: categories.length,
            categories
        });
        
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

// BUSCAR PRODUCTOS
exports.searchProducts = async (req, res) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;
        
        // Validar que venga query
        if (!q || q.trim() === '') {
            return res.status(400).json({ 
                error: 'Escribe algo para buscar' 
            });
        }

        const searchTerm = q.trim();

        // Validar mínimo 3 caracteres
        if (searchTerm.length < 3) {
            return res.status(400).json({ 
                error: 'Escribe al menos 3 caracteres' 
            });
        }

        const offset = (page - 1) * limit;

        // Dividir en palabras (mínimo 3 caracteres cada una)
        const words = searchTerm.split(/\s+/).filter(word => word.length >= 3);

        // Si después de filtrar no hay palabras válidas
        if (words.length === 0) {
            return res.status(400).json({ 
                error: 'Escribe palabras de al menos 3 caracteres' 
            });
        }

        // Crear condiciones para cada palabra
        const conditions = words.flatMap(word => [
            { title: { [Op.iLike]: `%${word}%` } },
            { description: { [Op.iLike]: `%${word}%` } },
            { category: { [Op.iLike]: `%${word}%` } }
        ]);

        const { count, rows: products } = await Product.findAndCountAll({
            where: {
                [Op.or]: conditions
            },
            limit: parseInt(limit),
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            query: searchTerm,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            products
        });
    } catch (error) {
        console.error('Error buscando productos:', error);
        res.status(500).json({ error: 'Error al buscar productos' });
    }
};