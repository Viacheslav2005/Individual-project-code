const express = require('express');
const db = require('../config/db');
const Institution = require('../models/institution');
const Favorites = require('../models/favorites');
const Reviews = require('../models/reviews');
const { isAuthenticated } = require('../middleware/auth'); // Middleware для проверки авторизации
const favorites = require('../models/favorites');
const router = express.Router();

// Главная страница
// router.get('/', async (req, res) => {
//     user: req.user || null 
//     const page = parseInt(req.query.page) || 1; // Текущая страница
//     const limit = 5; // Количество записей на страницу
//     const offset = (page - 1) * limit;
//     const search = req.query.search || ''; // Поиск
//     const filter = req.query.type || ''; // Фильтр по типу

//     try {
//         const institutions = await Institution.fetchInstitutionsPaginated(offset, limit, search, filter);
//         const totalCount = await Institution.countInstitutions(search, filter);
//         const totalPages = Math.ceil(totalCount / limit);

//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             // Если запрос асинхронный, возвращаем JSON
//             return res.json({ institutions, currentPage: page, totalPages });
//         }

//         res.render('pages/index', {
//             institutions,
//             currentPage: page,
//             totalPages,
//             search,
//             filter,
//             user: req.session.user || null,
//         });
//     } catch (error) {
//         console.error('Ошибка загрузки заведений:', error);
//         res.status(500).send('Ошибка сервера.');
//     }
// });

// router.get('/', async (req, res) => {
//     const page = parseInt(req.query.page) || 1; // Текущая страница
//     const limit = 5; // Количество записей на страницу
//     const offset = (page - 1) * limit;
//     const search = req.query.search || ''; // Поиск
//     const filter = req.query.type || ''; // Фильтр по типу

//     try {
//         const institutions = await Institution.fetchInstitutionsPaginated(offset, limit, search, filter);
//         const totalCount = await Institution.countInstitutions(search, filter);
//         const totalPages = Math.ceil(totalCount / limit);

//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//             // Если запрос асинхронный, возвращаем JSON
//             return res.json({ institutions, currentPage: page, totalPages });
//         }

//         // Передаём переменную user в шаблон
//         res.render('pages/index', {
//             institutions,
//             currentPage: page,
//             totalPages,
//             search,
//             filter,
//             user: req.session.user || null, // Проверка сессии
//         });
//     } catch (error) {
//         console.error('Ошибка загрузки заведений:', error);
//         res.status(500).send('Ошибка сервера.');
//     }
// });

router.get('/', async (req, res) => {
    const userId = req.session.user?.id;
    const page = parseInt(req.query.page) || 1; // Текущая страница
    const limit = 5; // Количество записей на страницу
    const offset = (page - 1) * limit;
    const search = req.query.search || ''; // Поиск
    const filter = req.query.type || ''; // Фильтр по типу

    try {
        const institutions = await Institution.fetchInstitutionsPaginated(offset, limit, search, filter);
        const totalCount = await Institution.countInstitutions(search, filter);
        const totalPages = Math.ceil(totalCount / limit);

        // Избранные заведения пользователя
        let favorites = [];
        if (userId) {
            favorites = (await Favorites.getFavoritesByUserId(userId)).map(fav => fav.id);
        }

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ 
                institutions, 
                currentPage: page, 
                totalPages, 
                favorites 
            });
        }

        res.render('pages/index', {
            institutions,
            currentPage: page,
            totalPages,
            search,
            filter,
            user: req.session.user || null,
            favorites
        });
    } catch (error) {
        console.error('Ошибка загрузки заведений:', error);
        res.status(500).send('Ошибка сервера.');
    }
});


// Маршрут для добавления в избранное
router.post('/add-favorite', async (req, res) => {
    try {
        const userId = req.session.user?.id; // Получение ID пользователя из сессии
        const {institutionId}  = req.body; // Получение ID заведения из тела запроса

        // if (!userId) {
        //     return res.status(401).json({ success: false, message: 'Пользователь не авторизован.' });
        // }

        // if (!institutionId) {
        //     return res.status(400).json({ success: false, message: 'ID заведения не указан.' });
        // }

        const existingFavorite = await Favorites.findOne(userId, institutionId);
        if (existingFavorite) {
            return res.status(409).json({ success: false, message: 'Заведение уже добавлено в избранное.' });
        }

        const newFavorite = await Favorites.addToFavorites(userId, institutionId);
        return res.status(200).json({ success: true, message: 'Заведение успешно добавлено в избранное.', data: newFavorite });
    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        res.status(500).json({ success: false, message: 'Произошла ошибка на сервере.' });
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


router.get('/reviews/:id', async (req, res) => {
    try {
        const institution_id = req.params.id;

        // Проверка существования заведения
        const [institution] = await db.query(
            'SELECT id, name FROM educational_institutions WHERE id = ?',
            [institution_id]
        );
        if (!institution || institution.length === 0) {
            return res.status(404).send('Заведение не найдено.');
        }

        // Получение отзывов для заведения
        const reviews = await Reviews.getAllForInstitution(institution_id);

        // Рендеринг страницы с отзывами
        res.render('pages/reviews', {
            institution: institution[0], // Передача информации о заведении
            reviews, // Отзывы для заведения
            user: req.session.user || null, // Передача информации о текущем пользователе
        });
    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
        res.status(500).send('Произошла ошибка на сервере.');
    }
});

// Маршрут для добавления отзыва
router.post('/reviews/add', async (req, res) => {
    try {
        const user_id = req.session.user?.id; // Получение user_id из сессии
        const { institution_id, content, rating } = req.body; // Извлечение данных из формы

        // Проверка на обязательные параметры
        if (!user_id || !institution_id || !content || !rating) {
            return res.status(400).send('Все поля обязательны для заполнения!');
        }

        // Проверка существования заведения
        const [institution] = await db.query('SELECT id FROM educational_institutions WHERE id = ?', [institution_id]);
        if (!institution.length) {
            return res.status(400).send('Указанное учебное заведение не существует.');
        }

        // Добавление отзыва
        await Reviews.create(user_id, institution_id, content, rating);

        // Перенаправление на страницу отзывов заведения
        res.redirect(`/reviews/${institution_id}`);
    } catch (error) {
        console.error('Ошибка при добавлении отзыва:', error);
        res.status(500).send('Произошла ошибка на сервере.');
    }
});



// Страница регистрации
router.get('/register', (req, res) => {
    res.render('pages/register');
});

// Страница входа
router.get('/login', (req, res) => {
    res.render('pages/login');
});


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
