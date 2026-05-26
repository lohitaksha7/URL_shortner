const express = require('express');
const router = express.Router();
const authenticate = require('../auth/authMiddleware');
const { getAnalytics } = require('./analyticsController');

router.get(
    '/:code',
    authenticate,
    getAnalytics,
);
module.exports = router;