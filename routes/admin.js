const express = require('express');
const Institution = require('../models/institution');
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Middleware
const router = express.Router();

router.use(isAdmin);

// Список заведений
router.get('/institutions', async (req, res) => {
    const institutions = await Institution.getAll();
    res.render('pages/admin/institutions', { institutions });
});

// Добавить заведение
router.post('/institutions', async (req, res) => {
    await Institution.create(req.body);
    res.redirect('/admin/institutions');
});

// Удалить заведение
router.post('/institutions/delete/:id', async (req, res) => {
    await Institution.delete(req.params.id);
    res.redirect('/admin/institutions');
});

// Обновить заведение
router.post('/institutions/edit/:id', async (req, res) => {
    await Institution.update(req.params.id, req.body);
    res.redirect('/admin/institutions');
});

router.get('/', isAuthenticated, isAdmin, (req, res) => {
    res.render('pages/admin', { user: req.session.user });
});

module.exports = router;
