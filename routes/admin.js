const express = require('express');
const Institution = require('../models/institution');
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Middleware
const router = express.Router();

// Проверка авторизации и роли администратора
router.use(isAuthenticated);
router.use(isAdmin);

// Главная страница админ-панели
router.get('/', (req, res) => {
    res.render('pages/admin', { title: 'Админ панель', user: req.session.user });
});

// Список заведений
router.get('/institutions', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Текущая страница
    const limit = 5; // Количество записей на страницу
    const offset = (page - 1) * limit;
    const search = req.query.search || ''; // Поисковый запрос
    const filter = req.query.type || ''; // Фильтр по типу

    try {
        const institutions = await Institution.getAllPaginated(offset, limit, search, filter);
        const totalCount = await Institution.countAll(search, filter);
        const totalPages = Math.ceil(totalCount / limit);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // Если запрос асинхронный, возвращаем JSON
            return res.json({ institutions, currentPage: page, totalPages });
        }

        res.render('pages/admin/institutions', {
            institutions,
            currentPage: page,
            totalPages,
            search,
            filter,
        });
    } catch (error) {
        console.error('Ошибка загрузки заведений:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


// Страница создания заведения
router.get('/create-institution', (req, res) => {
    res.render('pages/admin/create-institution', { title: 'Создание заведения' });
});

// Обработка создания заведения
router.post('/create-institution', async (req, res) => {
    const { name, description, address, latitude, longitude, type, rating } = req.body;

    try {
        if (!name || !address || !latitude || !longitude || !type || !rating) {
            return res.status(400).send('Все поля обязательны.');
        }

        await Institution.create({ name, description, address, latitude, longitude, type, rating });
        res.redirect('/admin/institutions');
    } catch (error) {
        console.error('Ошибка создания заведения:', error);
        res.status(500).send('Ошибка сервера.');
    }
});

// Страница редактирования заведения
router.get('/institutions/edit/:id', async (req, res) => {
    try {
        const institution = await Institution.getById(req.params.id); // Получение данных заведения по ID

        if (!institution) {
            return res.status(404).send('Заведение не найдено.');
        }

        res.render('pages/admin/edit-institution', { 
            title: 'Редактирование заведения', 
            institution 
        });
    } catch (error) {
        console.error('Ошибка загрузки заведения для редактирования:', error);
        res.status(500).send('Ошибка сервера.');
    }
});

// Обновить заведение
router.post('/institutions/edit/:id', async (req, res) => {
    try {
        await Institution.update(req.params.id, req.body);
        res.redirect('/admin/institutions');
    } catch (error) {
        console.error('Ошибка обновления заведения:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


// Удалить заведение
router.post('/institutions/delete/:id', async (req, res) => {
    try {
        await Institution.delete(req.params.id);
        res.redirect('/admin/institutions');
    } catch (error) {
        console.error('Ошибка удаления заведения:', error);
        res.status(500).send('Ошибка сервера.');
    }
});



module.exports = router;
