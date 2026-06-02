const express = require('express');
const router = express.Router();
const authenticate = require('../auth/authMiddleware');
const { getAnalytics, getGlobalAnalytics } = require('./analyticsController');

router.get(
    '/global',
    authenticate,
    getGlobalAnalytics,
);

router.get(
    '/:code',
    authenticate,
    getAnalytics,
);


module.exports = router;