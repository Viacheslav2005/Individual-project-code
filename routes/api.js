const express = require('express');
const db = require('../config/db'); // Подключение к базе данных
const router = express.Router();



router.get('/map', async (req, res) => {
    try {
        const [locations] = await db.query('SELECT name, description, latitude, longitude FROM educational_institutions');
        res.render('pages/map', { locations, title: 'Карта учебных заведений' });
    } catch (error) {
        console.error('Ошибка получения данных для карты:', error);
        res.status(500).send('Не удалось загрузить карту');
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

router.get('/search', async (req, res) => {
    const query = req.query.q; // Получаем параметр q из URL
    if (!query) {
        return res.status(400).json({ error: 'Параметр q обязателен' });
    }

    try {
        const [results] = await db.query(
            'SELECT id, name, latitude, longitude FROM educational_institutions WHERE name LIKE ?',
            [`%${query}%`]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Результаты не найдены' });
        }

        res.json(results); // Возвращаем JSON с результатами
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
