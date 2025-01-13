const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateBook} = require("../utils/request-data-validator");
const {validationResult} = require("express-validator");

router.get('/', function (req, res, next) {
    const query = 'SELECT b.title, b.format, b.page_count, b.listening_length, b.narrator, a.name as author, g.name AS genre FROM books b\n' +
        'JOIN authors a ON b.author_id = a.id\n' +
        'JOIN genres g ON b.genre_id = g.id';
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
    db.execute(insertQuery, [authorId, title.trim(), format, pageCount, listeningLength, narrator.trim(), genreId])
        .then(([result, _]) => {
            return res.status(201).json({bookId: result.insertId});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

router.put('/:id', validateBook(), function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const {authorId, title, format, pageCount=null, listeningLength=null, narrator=null, genreId} = req.body;
    const bookId = req.params.id;

    const updateQuery = 'UPDATE books SET author_id=?, title=?, format=?, page_count=?, listening_length=?, narrator=?, genre_id=? WHERE id = ?';
    db.execute(updateQuery, [authorId, title.trim(), format, pageCount, listeningLength, narrator.trim(), genreId, bookId])
        .then(([result, _]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({message: 'Book not found.'});
            }
            return res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

router.delete('/:id', function (req, res, next) {
    const bookId = req.params.id;
    if (isNaN(parseInt(bookId)))
        return res.status(400).json({message: 'Book ID should be an integer'});

    const deleteQuery = 'DELETE FROM books WHERE id=?';
    db.execute(deleteQuery, [bookId])
        .then(([result, _]) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({message: 'Book not found.'});
            }
            return res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});


module.exports = router;