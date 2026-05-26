require('dotenv').config();
require('./tracing');

const app = require('./app')
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

process.on(
    'SIGTERM',
    async() =>{
        console.log("Graceful shutdown...");
        server.close(async() =>{
            await prisma.$disconnect();
            process.exit(0);
        });
    }
);
