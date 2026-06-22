require('dotenv').config();
const { Worker } = require('bullmq');
const connection = require('./redisConnection');

const { trackClick } = require('../analytics/analyticsServices');

const worker = new Worker(
    'analyticsQueue',
    async(job)=>{\n        console.log(
            'Processing analytics job:',
            job.id,
            'for code',
            job.data.shortCode,
        );
        await trackClick(job.data);
    },
    {
        connection,
        concurrency: 10,
        settings: {
            maxStalledCount: 3,
            stalledInterval: 30000,
        }
    }
);

worker.on('completed', (job)=>{\n    console.log(
        `Job ${job.id} is completed.`
    );
});

worker.on('failed',(job,err)=>{\n    console.log(
        `Job ${job.id} failed to process analytics data. Error: `,
        err.message
    );
});

worker.on('error',(err)=>{\n    console.error("Redis worker connection error detected:",err);
});

worker.on('ready', () => {
    console.log('Worker is ready and listening for jobs');
});

module.exports = worker;

