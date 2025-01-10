const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateAuthor} = require("../utils/datavalidator");
const {validationResult} = require("express-validator");

/* GET all authors */
router.get('/', function (req, res, next) {
    const query = 'select * from authors;';
    db.query(query).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    })
});

/* POST a new author */
router.post('/', validateAuthor(), function (req, res, next) {
    const {name, birthdate} = req.body;

    // check if name and birthday are valid
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors)

    // insert a new author
    const insertQuery = 'INSERT INTO authors(name, birthdate) VALUES(?, ?);';
    db.execute(insertQuery, [name, birthdate]).then(([result, _]) => {
        return res.status(201).json({authorId: result.insertId});
    })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({message: err.message});
        })
})

module.exports = router;
