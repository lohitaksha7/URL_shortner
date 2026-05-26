const express = require('express');
const router = express.Router()
const authenticate = require('../auth/authMiddleware')
const {
shortenLimiter,
} = require('../middleware/rateLimiter');

const {
    shortenUrl,
    redirectUrl,
    getUrls,
} = require('../controllers/urlController');

const { client } = require('../monitoring/metrics');

router.post('/shorten',
    authenticate,
    shortenLimiter,
    shortenUrl
);
router.get('/:code', redirectUrl);
router.get('/urls',
    authenticate,
    getUrls,
)


module.exports = router;