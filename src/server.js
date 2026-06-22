require('dotenv').config();
require('./tracing');
const prisma = require('./db/prisma');
const worker = require('./queue/analyticsWorker');

const app = require('./app')
const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

// Ensure worker is listening for jobs
worker.on('ready', () => {
    console.log('Analytics worker is ready');
});

process.on(
    'SIGTERM',
    async() =>{
        console.log("Graceful shutdown...");
        await worker.close();
        server.close(async() =>{
            await prisma.$disconnect();
            process.exit(0);
        });
    }
);

