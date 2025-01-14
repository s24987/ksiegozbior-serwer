const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const booksQuery = 'SELECT was_read AS wasRead, COUNT(*) AS count FROM libraries\n' +
        'WHERE user_id = ?\n' +
        'GROUP BY was_read;';
    const rankingsQuery = 'SELECT COUNT(*) AS count FROM rankings\n' +
        'WHERE user_id = ?;';
    const reviewsQuery = 'SELECT COUNT(*) AS count FROM book_reviews\n' +
        'WHERE user_id = ?;';

    Promise.all([
        db.query(booksQuery, [userLoggedIn]),
        db.query(rankingsQuery, [userLoggedIn]),
        db.query(reviewsQuery, [userLoggedIn])
    ])
        .then(([booksData, rankingsData, reviewsData]) => {
            const books = booksData[0];
            let readBooks = 0;
            let unreadBooks = 0;
            if (books[0].wasRead === 1) {
                readBooks = books[0].count;
                unreadBooks = books[1].count;
            }
            else {
                readBooks = books[1].count;
                unreadBooks = books[0].count;
            }
            const response = {
                readBooksCount: readBooks,
                unreadBooksCount: unreadBooks,
                rankingsCount: rankingsData[0][0].count,
                reviewsCount: reviewsData[0][0].count
            };

            return res.json(response);
        }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

module.exports = router;