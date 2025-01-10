const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const authorsRouter = require('./routes/authors');
const usersRouter = require('./routes/users');
const genresRouter = require('./routes/genres');
const booksRouter = require('./routes/books');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors())

app.use('/authors', authorsRouter);
app.use('/users', usersRouter);
app.use('/genres', genresRouter);
app.use('/books', booksRouter);

module.exports = app;
