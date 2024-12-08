const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Настройка базы данных

// Middleware для проверки авторизации
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Вы не авторизованы.' });
    }
}

// Добавление заведения в избранное
router.post('/favorite', isAuthenticated, async (req, res) => {
    const { locationId } = req.body;
    const userId = req.session.user.id;

    if (!locationId) {
        return res.status(400).json({ error: 'Не указан ID заведения.' });
    }

    try {
        // Проверяем, существует ли запись
        const [existing] = await db.query(
            'SELECT * FROM favorites WHERE user_id = ? AND location_id = ?',
            [userId, locationId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Заведение уже в избранном.' });
        }

        // Добавляем в избранное
        await db.query(
            'INSERT INTO favorites (user_id, location_id) VALUES (?, ?)',
            [userId, locationId]
        );

        res.status(200).json({ message: 'Заведение добавлено в избранное.' });
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        res.status(500).json({ error: 'Ошибка сервера.' });
    }
});

module.exports = router;
