const db = require('../config/db');

const Institution = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM educational_institutions');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM educational_institutions WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const { name, description, type, address, latitude, longitude, rating } = data;
        await db.query('INSERT INTO educational_institutions (name, description, type, address, latitude, longitude, rating) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [name, description, type, address, latitude, longitude, rating]);
    },
    update: async (id, data) => {
        const { name, description, type, address, latitude, longitude, rating } = data;
        await db.query('UPDATE educational_institutions SET name = ?, description = ?, type = ?, address = ?, latitude = ?, longitude = ?, rating = ? WHERE id = ?', 
            [name, description, type, address, latitude, longitude, rating, id]);
    },
    delete: async (id) => {
        await db.query('DELETE FROM educational_institutions WHERE id = ?', [id]);
    }
};

module.exports = Institution;
