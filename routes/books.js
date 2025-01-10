const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateBook} = require("../utils/datavalidator");
const {validationResult} = require("express-validator");

router.get('/', function (req, res, next) {
    const query = 'SELECT * FROM books;';
    db.query(query).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

router.post('/', validateBook(), function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const {authorId, title, format, pageCount=null, listeningLength=null, narrator=null, genreId} = req.body;
    const insertQuery = 'INSERT INTO books(author_id, title, format, page_count, listening_length, narrator, genre_id) VALUES (?,?,?,?,?,?,?)';
    db.execute(insertQuery, [authorId, title, format, pageCount, listeningLength, narrator, genreId])
        .then(([result, _]) => {
            return res.status(201).json({bookId: result.insertId});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

module.exports = router;