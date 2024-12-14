const express = require('express');
const Favorites = require('../models/favorites');
const { isAuthenticated } = require('../middleware/auth'); // Middleware для проверки авторизации
const db = require('../config/db'); // Подключение к базе данных
const router = express.Router();



router.get('/map', async (req, res) => {
    try {
        const type = req.query.type || ''; // Получаем тип из query-параметра
        const query = type 
            ? 'SELECT id, name, description, latitude, longitude, type FROM educational_institutions WHERE type = ?' 
            : 'SELECT id, name, description, latitude, longitude, type FROM educational_institutions';
        
        // Если type есть, используем фильтрацию
        const [locations] = await db.query(query, [type]);
        res.render('pages/map', { locations, title: 'Карта учебных заведений' });
    } catch (error) {
        console.error('Ошибка получения данных для карты:', error);
        res.status(500).send('Не удалось загрузить карту');
    }
});

router.get('/user-favorites', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const favorites = await Favorites.getFavoritesByUserId(userId);
        res.json(favorites);
    } catch (error) {
        console.error('Ошибка загрузки избранных заведений:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


// router.get('/locations', async (req, res) => {
//     try {
//         const [locations] = await db.query('SELECT name, latitude, longitude FROM educational_institutions');
//         res.json(locations);
//     } catch (error) {
//         console.error('Ошибка получения меток:', error);
//         res.status(500).json({ error: 'Не удалось загрузить данные' });
//     }
// });

router.get('/locations', async (req, res) => {
    try {
        // SQL-запрос для выборки данных, включая ID
        const [locations] = await db.query('SELECT id, name, latitude, longitude FROM educational_institutions');
        
        // Отправка данных клиенту
        res.json(locations);
    } catch (error) {
        console.error('Ошибка получения данных:', error);
        res.status(500).json({ error: 'Не удалось загрузить данные' });
    }
});

// router.get('/search', async (req, res) => {
//     const query = req.query.q;
//     try {
//         const [results] = await db.query(
//             'SELECT name, latitude, longitude FROM educational_institutions WHERE name LIKE ?',
//             [`%${query}%`]
//         );
//         res.json(results);
//     } catch (error) {
//         console.error('Ошибка поиска:', error);
//         res.status(500).json({ error: 'Ошибка поиска' });
//     }
// });

// router.get('/search', async (req, res) => {
//     const query = req.query.q; // Получаем параметр q из URL
//     if (!query) {
//         return res.status(400).json({ error: 'Параметр q обязателен' });
//     }

//     try {
//         const [results] = await db.query(
//             'SELECT id, name, latitude, longitude FROM educational_institutions WHERE name LIKE ?',
//             [`%${query}%`]
//         );

//         if (results.length === 0) {
//             return res.status(404).json({ message: 'Результаты не найдены' });
//         }

//         res.json(results); // Возвращаем JSON с результатами
//     } catch (error) {
//         console.error('Ошибка выполнения поиска:', error);
//         res.status(500).json({ error: 'Ошибка поиска' });
//     }
// });

router.get('/search', async (req, res) => {
    const query = req.query.q || ''; // Параметр поиска (по названию)
    const type = req.query.type || ''; // Параметр фильтрации (по типу)

    try {
        // Основной SQL-запрос
        let sql = 'SELECT id, name, latitude, longitude FROM educational_institutions WHERE 1=1';
        const params = [];

        // Условие для фильтрации по названию
        if (query) {
            sql += ' AND name LIKE ?';
            params.push(`%${query}%`);
        }

        // Условие для фильтрации по типу
        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        const [results] = await db.query(sql, params);

        if (results.length === 0) {
            return res.status(404).json({ message: 'Результаты не найдены' });
        }

        res.json(results); // Возвращаем результаты
    } catch (error) {
        console.error('Ошибка выполнения поиска:', error);
        res.status(500).json({ error: 'Ошибка поиска' });
    }
});

router.get('/location/:id', async (req, res) => {
    const locationId = req.params.id;

    try {
        const [result] = await db.query(
            'SELECT name, description, address, latitude, longitude FROM educational_institutions WHERE id = ?',
            [locationId]
        );

        if (result.length === 0) {
            // Если локация не найдена
            return res.status(404).json({ error: 'Локация не найдена' });
        }

        res.json(result[0]); // Отправляем данные первой найденной записи
    } catch (error) {
        console.error('Ошибка получения информации об организации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});




module.exports = router;
