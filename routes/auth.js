const express = require('express');
const User = require('../models/user'); // Подключение модели пользователя
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Подключение middleware
const router = express.Router(); // Используйте Router вместо app

// Для профиля пользователя
router.get('/profile', isAuthenticated, (req, res) => {
    res.render('pages/profile', { title: 'Профиль', user: req.session.user });
});

// Для админ панели
router.get('/admin', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/admin', { title: 'Админ панель', user: req.session.user });
});

// Обработка маршрутов для регистрации
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).send('Все поля обязательны для заполнения');
        }

        await User.register({ username, email, password });
        res.redirect('/auth/login'); // Перенаправление после успешной регистрации
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).send('Ошибка регистрации');
    }
});

// Обработка маршрута для входа
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.authenticate({ email, password });

        if (!user) {
            return res.status(401).send('Неверный email или пароль');
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/profile');
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Выход из системы
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.get('/check', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

module.exports = router;
