const prisma = require('../db/prisma');
async function trackClick({
    shortCode,
    ipAddress,
    userAgent,
    referrer,
}){
    return prisma.clickEvent.create({
        data:{
            shortCode,
            ipAddress,
            userAgent,
            referrer,
        },
    });
}

module.exports = {
    trackClick,
};