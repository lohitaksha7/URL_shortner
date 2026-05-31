const express = require('express');
const router = express.Router()
const authenticate = require('../auth/authMiddleware')
const {
    shortenLimiter,
} = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/captchaMiddleware');

const {
    shortenUrl,
    redirectUrl,
    getUrls,
    deleteUrl,
    getStats,
    getUrlClicks,
} = require('../controllers/urlController');


router.post('/shorten',
    authenticate,
    shortenLimiter,
    verifyCaptcha,
    shortenUrl
);

router.get('/urls',
    authenticate,
    getUrls,
);

router.delete('/urls/:id',
    authenticate,
    deleteUrl,
);

router.get('/stats',
    authenticate,
    getStats,
);

router.get('/:code', redirectUrl);

router.get('/urls/:id/clicks',
    authenticate,
    getUrlClicks,
);

module.exports = router;