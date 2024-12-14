const db = require('../config/db');
const Reviews = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM reviews');
        return rows;
    },

    create: async (user_id, institution_id, content, rating) => {
        const query = `INSERT INTO reviews( user_id, institution_id, content, rating) VALUES (?, ?, ?, ?)`;

        const [result] = await db.query(query, [user_id, institution_id, content, rating]);
        return result.insertId;
    },
    getAllForInstitution: async (institution_id) => {
        const query = `
            SELECT r.id, r.content, r.rating, u.username as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.institution_id = ?
            ORDER BY r.created_at DESC
        `;
        const [rows] = await db.query(query, [institution_id]);
        return rows;
    },
    getAllForInstitution: async (institution_id) => {
        const query = `SELECT r.id, r.content, r.rating, u.username as user_name
                       FROM reviews r
                       JOIN users u ON r.user_id = u.id
                       WHERE r.institution_id = ?`;
        const [rows] = await db.query(query, [institution_id]);
        return rows;
    },
}

module.exports = Reviews;