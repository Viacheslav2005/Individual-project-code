const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const locationsRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const apiRoutes = require('./routes/api');
const mapRoutes = require('./routes/map'); // Подключение маршрутов карты
require('dotenv').config();

const app = express();

app.use('/api', apiRoutes);
app.use('/', mapRoutes); // Подключаем маршруты карты с корневым префиксом

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use('/locations', locationsRoutes);

// Парсинг данных
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Сессии
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true
}));

// Middleware для передачи данных пользователя в шаблоны
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Подключение маршрутов
app.use('/auth', authRoutes); // Маршруты авторизации
app.use('/', usersRoutes);    // Маршруты пользователя

// Запуск сервера
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
