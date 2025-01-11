const {body} = require('express-validator');

const customMessages = {
    notEmpty: 'This field cannot be empty',
    invalidDate: 'Date must be in the following format: YYYY-MM-DD'
};

// Date format "YYYY-MM-DD"
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

module.exports.validateAuthor = () => [
    body('name')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 3, max: 255}).withMessage('Name must be between 3 and 255 characters long'),

    body('birthdate')
        .optional()
        .isLength({min: 10, max: 10}).withMessage('Birthdate must be 10 characters long')
        .custom(value => {
            if (value) {
                const isRightFormat = dateRegex.test(value);
                if (!isRightFormat) return false;
                return !isNaN(Date.parse(value));
            }
            return true; // birthdate is optional
        })
        .toDate()
        .withMessage(customMessages.invalidDate)
];

module.exports.validateUser = () => [
    body('username')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 3, max: 255}).withMessage('Username must be between 3 and 255 characters long'),

    body('fullName')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 3, max: 255}).withMessage('Full name must be between 3 and 255 characters long'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({max: 255}).withMessage('Email must be no longer than 255 characters'),

    body('password')
        .isString()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 6, max: 255}).withMessage('Password must be between 6 and 255 characters long'),

    body('birthdate')
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 10, max: 10}).withMessage('Birthdate must be 10 characters long')
        .custom(value => {
            const isRightFormat = dateRegex.test(value);
            if (!isRightFormat) return false;
            return !isNaN(Date.parse(value));
        })
        .toDate()
        .withMessage('Birthdate must be a valid date')
];

module.exports.validateGenre = () => [
    body('name')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 3, max: 255}).withMessage('Genre name must be between 3 and 255 characters long')
];

module.exports.validateBook = () => [
    body('authorId')
        .isInt({gt: 0}).withMessage('Author ID must be a positive integer')
        .notEmpty({errorMessage: customMessages.notEmpty}),

    body('title')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .isLength({min: 3, max: 255}).withMessage('Title must be between 3 and 255 characters long'),

    body('format')
        .isString()
        .isIn(['paper', 'ebook', 'audiobook']).withMessage('Format must be one of: paper, ebook, electronic'),

    body('pageCount')
        .optional()
        .isInt({gt: 0}).withMessage('Page count must be a positive integer'),

    body('listeningLength')
        .optional()
        .isInt({gt: 0}).withMessage('Listening length must be a positive integer'),

    body('narrator')
        .optional()
        .isString()
        .trim()
        .isEmpty({errorMessage: customMessages.notEmpty})
        .isLength({max: 255}).withMessage('Narrator name must not exceed 255 characters'),

    body('genreId')
        .isInt({gt: 0}).withMessage('Genre ID must be a positive integer')
        .notEmpty({errorMessage: customMessages.notEmpty})
];

module.exports.validateLogin = () => [
    body('username')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty}),

    body('password')
        .isString()
        .trim()
        .notEmpty({errorMessage: customMessages.notEmpty})
        .hide()
];

module.exports.validateLibrary = () => [
    body('bookId')
        .isInt({gt: 0}).withMessage('Book ID must be a positive integer')
        .notEmpty({errorMessage: customMessages.notEmpty}),

    body('wasRead')
        .isBoolean().withMessage('Was read must be a boolean value (true or false)')
        .notEmpty({errorMessage: customMessages.notEmpty})
];

module.exports.validateBookReview = () => [
    body('bookId')
        .isInt({ gt: 0 }).withMessage('Book ID must be a positive integer')
        .notEmpty().withMessage(customMessages.notEmpty),

    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5')
        .notEmpty().withMessage(customMessages.notEmpty),

    body('text')
        .optional()
        .isLength({ max: 500 }).withMessage('Text must not exceed 500 characters'),
];

module.exports.validateRanking = () => [
    body('title')
        .isString()
        .trim()
        .notEmpty().withMessage(customMessages.notEmpty)
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters long'),

    body('numerationType')
        .isString()
        .trim()
        .notEmpty().withMessage(customMessages.notEmpty)
        .isIn(['decimal', 'roman']).withMessage('Numeration type must be either "decimal" or "roman"')
];

module.exports.validateRankingRecord = () => [
    body('recordPosition')
        .isInt({ gt: 0 }).withMessage('Record position must be a positive integer')
        .notEmpty().withMessage(customMessages.notEmpty),

    body('bookId')
        .isInt({ gt: 0 }).withMessage('Book ID must be a positive integer')
        .notEmpty().withMessage(customMessages.notEmpty),

    body('rankingId')
        .isInt({ gt: 0 }).withMessage('Ranking ID must be a positive integer')
        .notEmpty().withMessage(customMessages.notEmpty),
];