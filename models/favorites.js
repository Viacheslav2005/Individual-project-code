const db = require('../config/db');

const favorites = {

    // Получить заведение по ID
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM educational_institutions WHERE id = ?', [id]);
        return rows[0];
    },

    getAllPaginated: async (offset, limit, search = '', filter = '') => {
        let query = 'SELECT * FROM educational_institutions WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        if (filter) {
            query += ' AND type = ?';
            params.push(filter);
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        console.log('SQL Query:', query, 'Params:', params); // Отладка

        const [rows] = await db.query(query, params);
        return rows;
    },
    countAll: async (search = '', filter = '') => {
        let query = 'SELECT COUNT(*) as count FROM educational_institutions WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        if (filter) {
            query += ' AND type = ?';
            params.push(filter);
        }

        console.log('Count Query:', query, 'Params:', params); // Отладка

        const [rows] = await db.query(query, params);
        return rows[0].count;
    },

    
    fetchInstitutionsPaginated: async (offset, limit, search = '', filter = '') => {
        let query = 'SELECT * FROM educational_institutions WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        if (filter) {
            query += ' AND type = ?';
            params.push(filter);
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        console.log('SQL Query:', query, 'Params:', params); // Отладка

        const [rows] = await db.query(query, params);
        return rows;
    },
    countInstitutions: async (search = '', filter = '') => {
        let query = 'SELECT COUNT(*) as count FROM educational_institutions WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND name LIKE ?';
            params.push(`%${search}%`);
        }

        if (filter) {
            query += ' AND type = ?';
            params.push(filter);
        }

        console.log('Count Query:', query, 'Params:', params); // Отладка

        const [rows] = await db.query(query, params);
        return rows[0].count;
    },
    fetchInstitutionById: async (id) => {
        const [rows] = await db.query('SELECT * FROM educational_institutions WHERE id = ?', [id]);
        return rows[0];
    },
     // Получить избранные заведения пользователя
     getFavoritesByUserId: async (userId) => {
        const query = `
            SELECT ei.* 
            FROM favorites f
            JOIN educational_institutions ei ON f.institution_id = ei.id
            WHERE f.user_id = ?
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    },

    // Удалить заведение из избранного
    removeFromFavorites: async (userId, institutionId) => {
        const query = `DELETE FROM favorites WHERE user_id = ? AND institution_id = ?`;
        const [result] = await db.query(query, [userId, institutionId]);
        return result.affectedRows;
    },

    // Найти избранное заведение для пользователя
    findOne: async (userId, institutionId) => {
        const query = `
            SELECT * 
            FROM favorites
            WHERE user_id = ? AND institution_id = ?
        `;
        console.log('Executing Query:', query, 'Params:', userId, institutionId);
        const [rows] = await db.query(query, [userId, institutionId]);
        return rows[0] || null;
    },

    // Добавить заведение в избранное
    addToFavorites: async (userId, institutionId) => {
        console.log(userId, institutionId)
        const query = `INSERT INTO favorites (user_id, institution_id) VALUES (?, ?)`;
        const [result] = await db.query(query, [userId, institutionId]);
        return result.insertId; // Вернёт ID добавленной записи
    },
}

module.exports = favorites;