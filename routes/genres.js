const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateGenre} = require("../utils/request-data-validator");
const {validationResult} = require("express-validator");

/* GET all genres */
router.get('/', function (req, res, next) {
    const query = 'SELECT * FROM genres;';
    db.query(query).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    });
});

/* POST a new genre */
router.post('/', validateGenre(), function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const {name} = req.body;
    db.execute("INSERT INTO genres(name) VALUES (?)", [name.trim()])
        .then(([result, _]) => {
            return res.status(201).json({genreId: result.insertId});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message});
        });
});

module.exports = router;