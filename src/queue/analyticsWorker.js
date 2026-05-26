const { Worker } = require('bullmq');
const connection = require('./redisConnection');

const { trackClick } = require('../analytics/analyticsServices');

const worker = new Worker(
    'analyticsQueue',
    async(job)=>{
        console.log(
            'Processing analytics job:',
            job.id
        );
        await trackClick(job.data);
    },
    {
        connection,
        concurrency: 10,
    }
);

worker.on('completed', (job)=>{
    console.log(
        `Job ${job.id} is completed.`
    );
});

worker.on('failed',(job)=>{
    console.log(
        `Job ${job.id} failed.`,
        err
    );
});
