const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const locationsRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const path = require('path');
const cors = require('cors');
const mapRoutes = require('./routes/map'); // Подключение маршрутов карты
require('dotenv').config();

const app = express();

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Парсинг данных
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Для разработки secure=false
}));

// Middleware для передачи данных пользователя в шаблоны
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});
app.use(cors({
    origin: 'http://localhost:3306', // URL фронтенда
    methods: ['GET', 'POST'],
    credentials: true
}));


app.use('/api', apiRoutes);
app.use('/', mapRoutes); // Подключаем маршруты карты с корневым префиксом

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layouts/main');





// Middleware для передачи данных пользователя в шаблоны
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Подключение маршрутов
app.use('/auth', authRoutes); // Маршруты авторизации
app.use('/admin', adminRoutes); // Маршрут админа
app.use('/', usersRoutes);    // Маршруты пользователя
app.use('/locations', locationsRoutes); 


// Запуск сервера
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
