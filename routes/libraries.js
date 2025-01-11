const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateLibrary} = require("../utils/request-data-validator");
const {validationResult} = require("express-validator");
const {validateDbLibrary} = require("../utils/db-data-validator");

router.get('/', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();

    const query = 'SELECT b.title, b.format, b.page_count, b.listening_length, b.narrator, g.name AS genre, a.name AS author, l.was_read FROM libraries l\n' +
        'JOIN books b ON l.book_id=b.id\n' +
        'JOIN genres g ON b.genre_id = g.id\n' +
        'JOIN authors a ON b.author_id = a.id\n' +
        'WHERE l.user_id=?;';
    db.query(query, [userLoggedIn]).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

router.post('/', [validateLibrary(), validateDbLibrary()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();

    const {bookId, wasRead} = req.body;
    const insertQuery = 'INSERT INTO libraries(user_id, book_id, was_read) VALUES (?,?,?)';
    db.execute(insertQuery, [userLoggedIn, bookId, (wasRead==="0" || wasRead.toLowerCase()==="false")? Boolean('') : Boolean(wasRead)])
        .then(([result, _]) => {
            return res.status(201).json({libraryId: result.insertId});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

module.exports = router;