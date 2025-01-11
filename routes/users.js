const express = require('express');
const db = require("../database");
const {validateUser} = require("../utils/request-data-validator");
const {validationResult} = require("express-validator");
const {validateDbUser} = require("../utils/db-data-validator");
const router = express.Router();

/* GET user information */
router.get('/', function (req, res, next) {
    const userLoggedIn = req.session.userId;
    if (!userLoggedIn)
        return res.status(401).send();
    const query = 'SELECT username, full_name, email, birthdate FROM users WHERE id=?;';
    db.query(query, [userLoggedIn]).then(([data, metadata]) => {
        return res.json(data);
    }).catch(err => {
        console.log(err);
        return res.status(500).json({message: err.message});
    })
});

/* POST a new user */
router.post('/', [validateUser(), validateDbUser()], function (req, res, next) {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
        return res.status(400).json(validationErrors);

    // if validation passed, add user to the db
    const {username, fullName, email, password, birthdate} = req.body;
    const insertQuery = 'INSERT INTO users(username, full_name, email, password, birthdate, is_admin) VALUES (?,?,?,?,?,?)';
    db.execute(insertQuery, [username.trim(), fullName.trim(), email.trim(), password, birthdate, false])
        .then(([result, _]) => {
            return res.status(201).json({userId: result.insertId});
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({message: err.message})
        });
});

module.exports = router;
