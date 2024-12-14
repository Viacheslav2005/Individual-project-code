const express = require('express');
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



module.exports = router;
