const express = require('express');
const router = express.Router();
const db = require('../database');
const {validateLogin} = require("../utils/request-data-validator");
const {validationResult} = require("express-validator");

router.post('/', validateLogin(), function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    const {username, password} = req.body;
    db.query('SELECT id FROM users WHERE username=? AND password=?', [username, password])
        .then(([result, _]) => {
            req.session.userId = result[0].id;
            res.status(200).send();
    })
        .catch(err => {
            console.log(err);
            res.status(401).json({message: 'Username or password incorrect.'});
        });
});

module.exports = router;