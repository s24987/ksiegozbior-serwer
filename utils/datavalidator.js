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
        .optional({values: 'falsy'})
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
]

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
        .isLength({min: 10, max: 10})
        .custom(value => {
            const isRightFormat = dateRegex.test(value);
            if (!isRightFormat) return false;
            return !isNaN(Date.parse(value));
        })
        .toDate()
        .withMessage('Birthdate must be a valid date')
];