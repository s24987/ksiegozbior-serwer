const express = require('express');
const router = express.Router();
const db = require('../database');
const {validationResult} = require("express-validator");
const {validateRanking, validateRankingRecord} = require("../utils/request-data-validator");
const {validateDbRankingRecord} = require("../utils/db-data-validator");

/* GET all rankings for the logged-in user */
router.get('/', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();

    const query = 'SELECT r.id, r.title AS rankingTitle, r.numeration_type AS numerationType, rec.record_position AS recordPosition, b.title AS bookTitle, b.format, a.name AS author, g.name AS genre FROM rankings r\n' +
        'JOIN ranking_records rec ON r.id = rec.ranking_id\n' +
        'JOIN books b ON rec.book_id = b.id\n' +
        'JOIN authors a ON b.author_id = a.id\n' +
        'JOIN genres g ON b.genre_id = g.id\n' +
        'WHERE r.user_id=?\n' +
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
            mappedData[currentIndex].books.push({
                recordPosition: record.recordPosition,
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
        return res.status(401).send();

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
        return res.status(401).send();

    const {title, numerationType} = req.body;
    const insertQuery = 'INSERT INTO rankings (title, numeration_type, user_id) VALUES(?,?,?)';
    db.execute(insertQuery, [title.trim(), numerationType.trim(), userLoggedIn])
        .then(([result, _]) => {
            return res.status(201).send();
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

/* POST a new ranking record */
router.post('/:rankingId', [validateRankingRecord(), validateDbRankingRecord()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();

    const {rankingId, bookId, recordPosition} = req.body;
    const rankingIdParam = parseInt(req.params.rankingId);
    if (isNaN(rankingIdParam))
        return res.status(400).json({message: 'Ranking ID should be an integer'});
    if (req.params.rankingId !== rankingId)
        return res.status(400).json({message: 'Ranking IDs in body and route don\'t match'});

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

module.exports = router;