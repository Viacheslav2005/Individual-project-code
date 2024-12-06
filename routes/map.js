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



module.exports = router;
