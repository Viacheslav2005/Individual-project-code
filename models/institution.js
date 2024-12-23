const db = require('../config/db');

const Institution = {
    // Получить все заведения
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM educational_institutions');
        return rows;
    },

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
    

    // Создать новое заведение
    create: async ({ name, description, address, latitude, longitude, type, rating }) => {
        const query = `
            INSERT INTO educational_institutions (name, description, address, latitude, longitude, type, rating) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [name, description, address, latitude, longitude, type, rating]);
        return result.insertId;
    },

    // Обновить данные заведения
    update: async (id, { name, description, address, latitude, longitude, type, rating }) => {
        const query = `
            UPDATE educational_institutions 
            SET name = ?, description = ?, type = ?, address = ?, latitude = ?, longitude = ?, rating = ?
            WHERE id = ?
        `;
        const [result] = await db.query(query, [name, description, type, address, latitude, longitude, rating, id]);
        return result.affectedRows; // Возвращаем количество изменённых записей
    },

    // Удалить заведение
    delete: async (id) => {
        const query = `DELETE FROM educational_institutions WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result.affectedRows; // Возвращаем количество удалённых записей
    },


   
};

module.exports = Institution;