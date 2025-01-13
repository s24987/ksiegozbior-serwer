const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const authorsRouter = require('./routes/authors');
const usersRouter = require('./routes/users');
const genresRouter = require('./routes/genres');
const booksRouter = require('./routes/books');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const libraryRouter = require('./routes/libraries');
const bookReviewsRouter = require('./routes/book-reviews');
const rankingsRouter = require('./routes/rankings');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    },
}));

app.use('/authors', authorsRouter);
app.use('/users', usersRouter);
app.use('/genres', genresRouter);
app.use('/books', booksRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/libraries', libraryRouter);
app.use('/book-reviews', bookReviewsRouter);
app.use('/rankings', rankingsRouter);

module.exports = app;
