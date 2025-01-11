const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateBookReview} = require("../utils/request-data-validator");
const {validationResult} = require("express-validator");
const {validateDbBookReview} = require("../utils/db-data-validator");

/* GET all reviews for the logged-in user */
router.get('/', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();

    const query = 'SELECT u.username, b.title, b.format, br.rating, br.text from book_reviews br\n' +
        'JOIN users u ON br.user_id = u.id\n' +
        'JOIN books b ON br.book_id = b.id\n' +
        'WHERE br.user_id=?;';
    db.query(query, [userLoggedIn]).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

router.get('/:bookId', function (req, res, next) {
    const bookIdParam = req.params.bookId;
    const bookId = parseInt(bookIdParam);
    if (isNaN(bookId))
        return res.status(400).json({message: 'Book ID should be an integer'});

    const query = 'SELECT u.username, b.title, b.format, br.rating, br.text from book_reviews br\n' +
        'JOIN users u ON br.user_id = u.id\n' +
        'JOIN books b ON br.book_id = b.id\n' +
        'WHERE br.book_id=?;';
    db.query(query, [bookId]).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

router.post('/', [validateBookReview(), validateDbBookReview()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();

    const {bookId, rating, text=null} = req.body;
    const insertQuery = 'INSERT INTO book_reviews (user_id, book_id, rating, text) VALUES(?,?,?,?)';
    db.execute(insertQuery, [userLoggedIn, bookId, rating, text])
        .then(([result, _]) => {
            return res.status(201).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

module.exports = router;