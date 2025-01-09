const express = require('express');
const router = express.Router();
const db = require('../database');

/* GET all authors */
router.get('/', function(req, res, next) {
  const query = 'select * from authors;';
  db.execute(query).then( ([data, metadata]) => {
    console.log(data);
    return res.json(data);
  })
});

module.exports = router;
