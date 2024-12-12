const express = require('express');
const Institution = require('../models/institution');
const Favorites = require('../models/favorites');
const { isAuthenticated } = require('../middleware/auth'); // Middleware для проверки авторизации
const favorites = require('../models/favorites');
const router = express.Router();

// Главная страница
router.get('/', async (req, res) => {
    user: req.user || null 
    const page = parseInt(req.query.page) || 1; // Текущая страница
    const limit = 5; // Количество записей на страницу
    const offset = (page - 1) * limit;
    const search = req.query.search || ''; // Поиск
    const filter = req.query.type || ''; // Фильтр по типу

    try {
        const institutions = await Institution.fetchInstitutionsPaginated(offset, limit, search, filter);
        const totalCount = await Institution.countInstitutions(search, filter);
        const totalPages = Math.ceil(totalCount / limit);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // Если запрос асинхронный, возвращаем JSON
            return res.json({ institutions, currentPage: page, totalPages });
        }

        res.render('pages/index', {
            institutions,
            currentPage: page,
            totalPages,
            search,
            filter,
            user: req.session.user || null,
        });
    } catch (error) {
        console.error('Ошибка загрузки заведений:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


router.get('/institution/:id', async (req, res) => {
    try {
        const institution = await Institution.fetchInstitutionById(req.params.id);
        if (!institution) {
            return res.status(404).send('Заведение не найдено');
        }
        res.render('pages/institution', { institution });
    } catch (error) {
        console.error('Ошибка загрузки заведения:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


router.get('/calatog', async (req, res) => {
    const institution = await Institution.getAll(req.params.id);
    if (!institution) {
        return res.status(404).send('Institution not found');
    }
    res.render('pages/calatog', { institution });
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
// router.get('/profile', isAuthenticated, async (req, res) => {
//     try {
//         const userId = req.session.user?.id;
//         if (!userId) {
//             return res.redirect('/auth/login');
//         }

//         console.log('Сессия пользователя:', req.session.user);

//         // SQL-запрос для получения избранных заведений
//         console.log('Выполнение запроса для user_id:', userId);
//         const [favorites] = await db.query(
//             `SELECT ei.id, ei.name, ei.description, ei.address 
//              FROM favorites f
//              JOIN educational_institutions ei ON f.institution_id = ei.id
//              WHERE f.user_id = ?`,
//             [userId]
//         );
//         console.log('Результаты SQL-запроса:', favorites);

//         res.render('pages/profile', { 
//             user: req.session.user,
//             favorites,
//         });
//     } catch (error) {
//         console.error('Ошибка загрузки профиля:', error.message, error.stack);
//         res.status(500).send('Ошибка загрузки профиля.');
//     }
// });

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error('User data is not available in the request');
        }
        const userId = req.user.id;
        const favorites = await Favorites.getFavoritesByUserId(userId);

        res.render('pages/profile', {
            user: req.user,
            favorites,
        });
    } catch (error) {
        console.error('Ошибка загрузки избранных заведений:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


// Удалить заведение из избранного
router.post('/favorites/remove', isAuthenticated, async (req, res) => {
    try {
        const { institutionId } = req.body;
        const userId = req.user.id; // Предполагаем, что ID пользователя доступен через `req.user`

        const result = await Favorites.removeFromFavorites(userId, institutionId);

        if (result > 0) {
            res.redirect('/profile');
        } else {
            res.status(400).send('Не удалось удалить заведение из избранного.');
        }
    } catch (error) {
        console.error('Ошибка удаления из избранного:', error);
        res.status(500).send('Ошибка сервера.');
    }
});



module.exports = router;
