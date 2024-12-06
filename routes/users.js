const express = require('express');
const Institution = require('../models/institution');
const { isAuthenticated } = require('../middleware/auth'); // Middleware для проверки авторизации
const router = express.Router();

// Главная страница
router.get('/', async (req, res) => {
    const institutions = await Institution.getAll();
    res.render('pages/index', { institutions, user: req.session.user });
});
router.get('/calatog', async (req, res) => {
    const institution = await Institution.getAll(req.params.id);
    if (!institution) {
        return res.status(404).send('Institution not found');
    }
    res.render('pages/calatog', { institution });
});
// Страница заведения
router.get('/institution/:id', async (req, res) => {
    const institution = await Institution.getById(req.params.id);
    if (!institution) {
        return res.status(404).send('Institution not found');
    }
    res.render('pages/institution', { institution });
});

// Страница регистрации
router.get('/register', (req, res) => {
    res.render('pages/register');
});

// Страница входа
router.get('/login', (req, res) => {
    res.render('pages/login');
});

// Маршрут профиля пользователя
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('pages/profile', { user: req.session.user });
});


module.exports = router;
