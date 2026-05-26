const { Queue } = require('bullmq');

const connection = require('./redisConnection');

const analyticsQueue = new Queue(
    'analyticsQueue',
     {
        connection,
     }
);
module.exports = analyticsQueue;