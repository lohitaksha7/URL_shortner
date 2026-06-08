const prisma = require('../db/prisma');
const UA_parser = require('ua-parser-js');

async function getAnalytics(req,res){
    try{
        const { code } = req.params;

        const urlRecord = await prisma.url.findUnique({
            where:{
                shortCode : code,
            }
        });
        if(!urlRecord){
            return res.status(404).json({
                error: "Url not found."
            });
        }
        const totalClicksCount = await prisma.clickEvent.count({
            where: {shortCode: code},
        });
        const clickEvents = await prisma.clickEvent.findMany({
            where:{ shortCode: code },
            orderBy: {clickedAt: 'desc'},
            take: 5000,
        });

        const devices = { Mobile: 0, Tablet: 0, Desktop: 0};
        const browsers = {};
        const os = {};

        clickEvents.forEach(event =>{
            const parser = new UA_parser(event.userAgent);
            const deviceType = parser.getDevice().type || 'Desktop';
            const browserName = parser.getBrowser().name || 'Unknown';
            const osName = parser.getOS().name || 'Unknown';

            const typeKey = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
            devices[typeKey] = (devices[typeKey] || 0) + 1;
            browsers[browserName] = (browsers[browserName] || 0) + 1;
            os[osName] = (os[osName] || 0) + 1;
        });

        const topReferrers = await prisma.clickEvent.groupBy({
            by: [ 'referrer' ],
            where: {shortCode: code},
            _count: { id:true },
            orderBy: { _count: { id: 'desc'}},
            take : 5
        });

        const hourlyEngagement = await prisma.clickEvent.groupBy({
            by: ['clickedAt'],
            where: { shortCode: code },
            _count: { id: true},
            orderBy: { clickedAt: 'asc'}
        });

        return res.json({
//            totalClicks: clickEvents.length,
            totalClicks: totalClicksCount,
            recentClicks: clickEvents.slice(0,10),

            devices: Object.entries(devices).map(([name,value])=>({name,value})),
            browsers: Object.entries(browsers).map(([name,value])=> ({name,value})),
            os: Object.entries(os).map(([name,value])=> ({name,value})),

            referrer: topReferrers.map(r =>({
                name: r.referrer || 'Direct',
                clicks: r._count.id
            }))
        });
    }catch(error){
        console.error("[getAnalytics Error]: ",error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function getGlobalAnalytics(req,res){
    try{
        const userId = req.user.userId;

        const totalLinks = await prisma.url.count({
            where:{ userId }
        });

        const totalClicks = await prisma.clickEvent.count({
            where: { url: { userId } }
        });

        const globalReferrers = await prisma.clickEvent.groupBy({
            by: [ 'referrer' ],
            where: { url: { userId }},
            _count: { id: true },
            orderBy: { _count: { id: 'desc' }}
        });

        const topLinkGroup = await prisma.clickEvent.groupBy({
            by: [ 'urlId' ],
            where: { url: { userId }},
            _count: {id:true},
            orderBy: { _count: {id:'desc'}},
            take: 1,
        });

        let starLinkDetails = null;
        if(topLinkGroup.length>0){
            starLinkDetails = await prisma.url.findUnique({
                where: {
                    id: topLinkGroup[0].urlId
                },
                select: {shortCode: true, originalUrl: true},
            });
        }

        return res.json({
            totalLinks: totalLinks,
            totalClicks,
            globalReferrers: globalReferrers.map(r =>({
                name: r.referrer || 'Direct',
                clicks: r._count.id
            })),
            starLink: starLinkDetails ? {
                shortCode: starLinkDetails.shortCode,
                originalUrl: starLinkDetails.originalUrl,
                clicks: topLinkGroup[0]._count.id
            }: null,
//            topLinkId: topLink[0]?.urlId || null,
//            topLinkClickCount: topLink[0]?._count || 0,
        });

    }catch(error){
        console.error("[getGlobalAnalytics] Error: ",error);
        return res.status(500).json({
            error: "Internal Server Error."
        });
    }
}

module.exports = {
    getAnalytics,
    getGlobalAnalytics,
}