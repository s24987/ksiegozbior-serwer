const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const authorsRouter = require('./routes/authors');
const usersRouter = require('./routes/users');
const genresRouter = require('./routes/genres');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors())

app.use('/authors', authorsRouter);
app.use('/users', usersRouter);
app.use('/genres', genresRouter);

module.exports = app;
