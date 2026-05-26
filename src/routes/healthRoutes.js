const express = require('express');
const prisma = require('../db/prisma');
const connection = require('../queue/redisConnection');
const router = express.Router();

router.get(
    '/health',
    async (req,res)=>{
        try{
            await prisma.$queryRaw`SELECT 1`;
            await connection.ping();
            return res.json({
                status: 'healthy',
            });
        }catch(error){
            return res.status(500).json({
                status: 'unhealthy',
            });
        }
    }
);

module.exports = router;