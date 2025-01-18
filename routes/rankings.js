const express = require('express');
const router = express.Router();
const db = require('../database');
const {validationResult} = require("express-validator");
const {
    validateRanking,
    validateRankingRecord,
    validateRankingRecordDelete
} = require("../utils/request-data-validator");
const {
    validateDbRankingRecord,
    validateDbRankingRecordDelete,
    validateDbRankingRecordUpdate
} = require("../utils/db-data-validator");

/* GET all rankings for the logged-in user */
router.get('/', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const query = 'SELECT r.id, r.title AS rankingTitle, r.numeration_type AS numerationType,\n' +
        '       rec.record_position AS recordPosition, b.title AS bookTitle,\n' +
        '       b.id AS bookId, b.format, a.name AS author, g.name AS genre\n' +
        'FROM rankings r\n' +
        'LEFT JOIN ranking_records rec ON r.id = rec.ranking_id\n' +
        'LEFT JOIN books b ON rec.book_id = b.id\n' +
        'LEFT JOIN authors a ON b.author_id = a.id\n' +
        'LEFT JOIN genres g ON b.genre_id = g.id\n' +
        'WHERE r.user_id=? ' +
        'ORDER BY r.id, rec.record_position;';
    db.query(query, [userLoggedIn]).then(([data, metadata]) => {
        if (data.length === 0)
            return res.json(data);
        const mappedData = [];
        let currentIndex = -1;
        data.map(record => {
            const rankingId = record.id;
            if (mappedData.length === 0 || mappedData[currentIndex].id !== rankingId) {
                mappedData.push({
                    id: rankingId,
                    rankingTitle: record.rankingTitle,
                    numerationType: record.numerationType,
                    books: []
                });
                currentIndex += 1;
            }
            if (record.recordPosition != null)
                mappedData[currentIndex].books.push({
                    recordPosition: record.recordPosition,
                    bookId: record.bookId,
                    bookTitle: record.bookTitle,
                    format: record.format,
                    author: record.author,
                    genre: record.genre
                })
        });
        return res.json(mappedData);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

/* GET all records for a specific ranking */
router.get('/:rankingId', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const rankingIdParam = req.params.rankingId;
    const rankingId = parseInt(rankingIdParam);
    if (isNaN(rankingId))
        return res.status(400).json({message: 'Ranking ID should be an integer'});

    const query = 'SELECT r.id, r.title AS rankingTitle, r.numeration_type AS numerationType, rec.record_position AS recordPosition, b.title AS bookTitle, b.format, a.name AS author, g.name AS genre FROM rankings r\n' +
        'JOIN ranking_records rec ON r.id = rec.ranking_id\n' +
        'JOIN books b ON rec.book_id = b.id\n' +
        'JOIN authors a ON b.author_id = a.id\n' +
        'JOIN genres g ON b.genre_id = g.id\n' +
        'WHERE r.user_id=? and ranking_id=?\n' +
        'ORDER BY r.id, rec.record_position;';
    db.query(query, [userLoggedIn, rankingId]).then(([data, metadata]) => {
        if (data.length === 0)
            return res.json(data);
        const mappedData = {
            id: data[0].id,
            rankingTitle: data[0].rankingTitle,
            numerationType: data[0].numerationType,
            books: []
        };
        data.map(record => {
            mappedData.books.push({
                recordPosition: record.recordPosition,
                bookTitle: record.bookTitle,
                format: record.format,
                author: record.author,
                genre: record.genre
            });
        });
        return res.json(mappedData);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

/* POST a new ranking */
router.post('/', [validateRanking()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const {rankingTitle, numerationType} = req.body;
    const insertQuery = 'INSERT INTO rankings (title, numeration_type, user_id) VALUES(?,?,?)';
    db.execute(insertQuery, [rankingTitle.trim(), numerationType.trim(), userLoggedIn])
        .then(([result, _]) => {
            return res.status(201).json({id: result.insertId});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

/* POST a new ranking record */
router.post('/records/:rankingId', [validateRankingRecord(), validateDbRankingRecord()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const {bookId, recordPosition} = req.body;
    const rankingIdParam = parseInt(req.params.rankingId);
    if (isNaN(rankingIdParam))
        return res.status(400).json({message: 'Ranking ID should be an integer'});

    const insertQuery = 'INSERT INTO ranking_records (ranking_id, book_id, user_id, record_position) VALUES(?,?,?, ?)';
    db.execute(insertQuery, [rankingIdParam, bookId, userLoggedIn, recordPosition])
        .then(([result, _]) => {
            return res.status(201).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

/* UPDATE a ranking record */
router.put('/records/:rankingId', [validateRankingRecord(), validateDbRankingRecordUpdate()], function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const {bookId, recordPosition} = req.body;
    const rankingIdParam = parseInt(req.params.rankingId);

    if (isNaN(rankingIdParam))
        return res.status(400).json({message: 'Ranking ID should be an integer'});

    const updateQuery = 'UPDATE ranking_records SET record_position=? WHERE ranking_id=? AND book_id=? AND user_id=?';
    db.execute(updateQuery, [recordPosition, rankingIdParam, bookId, userLoggedIn])
        .then(([result, _]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send();
            }
            return res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

/* DELETE a ranking record */
router.delete('/records/:rankingId', [validateRankingRecordDelete(), validateDbRankingRecordDelete()], function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const {bookId} = req.body;
    const rankingIdParam = parseInt(req.params.rankingId);

    if (isNaN(rankingIdParam))
        return res.status(400).json({message: 'Ranking ID should be an integer'});

    const deleteQuery = 'DELETE FROM ranking_records WHERE ranking_id=? AND book_id=? AND user_id=?';
    db.execute(deleteQuery, [rankingIdParam, bookId, userLoggedIn])
        .then(([result, _]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send();
            }
            return res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

/* UPDATE a ranking */
router.put('/:rankingId', [validateRanking()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const rankingIdParam = parseInt(req.params.rankingId);
    if (isNaN(rankingIdParam))
        return res.status(400).json({message: 'Ranking ID should be an integer'});

    const {rankingTitle, numerationType} = req.body;
    const updateQuery = 'UPDATE rankings SET title=?, numeration_type=? WHERE id=? AND user_id=?';
    db.execute(updateQuery, [rankingTitle.trim(), numerationType.trim(), rankingIdParam, userLoggedIn])
        .then(([result, _]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send();
            }
            return res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

/* DELETE a ranking */
router.delete('/:rankingId', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).json({message: 'User not logged in'});

    const rankingIdParam = parseInt(req.params.rankingId);

    if (isNaN(rankingIdParam))
        return res.status(400).json({message: 'Ranking ID should be an integer'});

    const deleteQuery = 'DELETE FROM rankings WHERE id=? AND user_id=?';
    db.execute(deleteQuery, [rankingIdParam, userLoggedIn])
        .then(([result, _]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send();
            }
            return res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

module.exports = router;