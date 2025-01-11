const {body} = require('express-validator');
const db = require('../database');

module.exports.validateDbUser = () => [
    body()
        .custom(async (bodyData) => {
            const username = bodyData.username;
            const email = bodyData.email;
            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM users WHERE username=? OR email=?', [username, email]);
            if(result[0].count > 0) {
                throw new Error('Username or email already exists');
            }
        })
];

module.exports.validateDbLibrary = () => [
    body()
        .custom(async (bodyData, {req}) => {
            const userId = req.session.userId;
            const bookId = bodyData.bookId;
            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM libraries WHERE user_id=? AND book_id=?', [userId, bookId]);
            if(result[0].count > 0) {
                throw new Error('This book is already in the library');
            }
        })
];

module.exports.validateDbBookReview = () => [
    body()
        .custom(async (bodyData, {req}) => {
            const userId = req.session.userId;
            const bookId = bodyData.bookId;
            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM book_reviews WHERE user_id=? AND book_id=?', [userId, bookId]);
            if(result[0].count > 0) {
                throw new Error('This book is already reviewed by user');
            }
        })
];

module.exports.validateDbRankingRecord = () => [
    body()
        .custom(async (bodyData, {req}) => {
            const userId = req.session.userId;
            const bookId = bodyData.bookId;
            const rankingId = bodyData.rankingId;
            // check if ranking ID exists
            const [rankingResult] = await db.query('SELECT COUNT(*) AS countRankings FROM rankings WHERE id=?', [rankingId]);
            if (rankingResult[0].countRankings === 0) {
                throw new Error('Invalid ranking ID');
            }
            // check if book ID exists
            const [bookResult] = await db.query('SELECT COUNT(*) AS countBooks FROM books WHERE id=?', [bookId]);
            if (bookResult[0].countBooks === 0) {
                throw new Error('Invalid book ID');
            }
            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM ranking_records WHERE user_id=? AND book_id=? AND ranking_id=?', [userId, bookId, rankingId]);
            if(result[0].count > 0) {
                throw new Error('This book is already in the ranking');
            }
        })
];

module.exports.validateDbRankingRecordUpdate = () => [
    body()
        .custom(async (bodyData, {req}) => {
            const userId = req.session.userId;
            const bookId = bodyData.bookId;
            const rankingId = req.params.rankingId;

            // check if ranking ID exists
            const [rankingResult] = await db.query('SELECT COUNT(*) AS countRankings FROM rankings WHERE id=?', [rankingId]);
            if (rankingResult[0].countRankings === 0) {
                throw new Error('Invalid ranking ID');
            }
            // check if book ID exists
            const [bookResult] = await db.query('SELECT COUNT(*) AS countBooks FROM books WHERE id=?', [bookId]);
            if (bookResult[0].countBooks === 0) {
                throw new Error('Invalid book ID');
            }
            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM ranking_records WHERE user_id=? AND book_id=? AND ranking_id=?', [userId, bookId, rankingId]);
            if(result[0].count === 0) {
                throw new Error('This book is not in the ranking');
            }
        })
];

module.exports.validateDbRankingRecordDelete = () => [
    body()
        .custom(async (bodyData, {req}) => {
            const userId = req.session.userId;
            const bookId = bodyData.bookId;
            const rankingId = req.params.rankingId;

            const [result, _] = await db.query('SELECT COUNT(*) AS count FROM ranking_records WHERE user_id=? AND book_id=? AND ranking_id=?', [userId, bookId, rankingId]);
            if(result[0].count === 0) {
                throw new Error('Invalid record');
            }
        })
];