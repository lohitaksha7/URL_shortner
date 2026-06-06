const prisma = require('../db/prisma');

async function trackClick(payload){
    const { shortCode, ipAddress, userAgent, referrer, urlId } = payload;
    try{
//        const urlRecord = await prisma.url.findUnique({
//            where:{ shortCode: shortCode },
//        });
//        if(!urlRecord){
//            console.warn(`[Analytics Service] Tracking skipped. Short code ${shortCode} does not exist in DB.`);
//            return null;
//        }
        const analyticsRecord = await prisma.clickEvent.create({
            data:{
                shortCode: shortCode,
                ipAddress: ipAddress || 'Unknown',
                userAgent: userAgent || 'Unknown',
                referrer:  referrer  || 'Direct',
                clickedAt: new Date(),
//                urlId: urlRecord.id,
                urlId: urlId,
            }
        });
        console.log(`[Analytics Service] Event registered in clickEvent table. Row ID: ${analyticsRecord.id}`);
        return analyticsRecord;
    }catch(error){
        console.error(`[Analytics service error] Failed to write event for code ${shortCode}:`,error);
        throw error;
    }
}


module.exports = {
    trackClick,
};