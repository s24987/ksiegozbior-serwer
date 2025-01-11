const express = require('express');
const router = express.Router();


router.post('/', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Error during logout.' });
            }
            res.clearCookie('connect.sid');
            res.status(200).send();
        });
    } else {
        res.status(400).send();
    }
});

module.exports = router;