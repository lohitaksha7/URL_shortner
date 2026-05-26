const prisma = require('../db/prisma');

async function getAnalytics(req,res){
      try{
        const { code } = req.params;
        const totalClicks = await prisma.clickEvent.count({
            where:{
                shortCode: code,
            },
        });
        const clicks = await prisma.clickEvent.findMany({
            where:{
                shortCode: code,
            },
            orderBy:{
                createdAt: 'desc',
            },
            take: 20,
        });
        return res.json({
           totalClicks,
           recentClicks: clicks,
        });
      }catch(error){
           return res.status.json({
                error: 'Internal Server Error',
           });
      }
}

module.exports = {
    getAnalytics,
};