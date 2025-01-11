const {body} = require('express-validator');
const db = require('../database');

module.exports.validateDbUser = () => [
    body('username')
        .isString()
        .trim()
        .custom(async (value) => {
            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM users WHERE username=?', [value]);
            if(result[0].count > 0) {
                throw new Error('Username already exists');
            }
        })
];