const { RedisStore } = require('rate-limit-redis');
const rateLimit = require('express-rate-limit');
const connection = require('../queue/redisConnection');

const authLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => connection.call(...args),
    }),
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:{
        error: 'Too many requests',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const shortenLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => connection.call(...args),
    }),
    windowMs: 60 * 1000,
    max: 20,
    message:{
        error: 'Too many shortened urls created',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    shortenLimiter,
};