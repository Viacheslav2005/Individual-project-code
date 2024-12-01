const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    register: async ({ username, email, password }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
    },
    authenticate: async ({ email, password }) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        return null;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = User;
