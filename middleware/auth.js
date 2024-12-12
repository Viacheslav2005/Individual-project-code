module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            req.user = req.session.user; // Добавляем данные пользователя в req.user
            return next();
        }
        res.redirect('/auth/login'); // Перенаправление на страницу входа, если пользователь не авторизован
    },
    isAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'admin') {
            req.user = req.session.user; // Добавляем данные пользователя в req.user
            return next();
        }
        res.status(403).send('Доступ запрещен');
    }
};