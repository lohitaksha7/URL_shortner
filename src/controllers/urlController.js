const {
    createShortUrl,
    getOriginalUrl,
} = require('../services/urlService');
const { Mutex } = require('async-mutex');

const mutex = new Mutex();

const validator = require('validator');
const prisma = require('../db/prisma');
const trackClick = require('../analytics/analyticsServices');
const analyticsQueue = require('../queue/analyticsQueue');
const {
    getCachedUrl,
    cacheUrl,
} = require('../cache/cacheService');

async function shortenUrl(req,res){
    try{
        const { url, CustomAlias, expiresAt } = req.body;
        if(!url || !validator.isURL(url)){
            return res.status(400).json({
                error: 'Valid URL is required.',
            })
        }

        let newUrl = url.trim();
        if (!/^https?:\/\//i.test(url)) {
            newUrl = `https://${newUrl}`;
        }
//        console.log(url);
        const userId = req.user.userId;
//        if(CustomAlias){
//                const Exist_CA = await prisma.url.findUnique({
//                    where:{
//                        shortCode: CustomAlias
//                    },
//                });
//            if(!Exist_CA){
//                return res.status(201).json({
//                    shortUrl: `${process.env.BASE_URL}/${Exist_CA.shortCode}`,
//                    shortCode: result.shortCode,
//                    OriginalUrl: result.originalUrl,
//                });
//            }
//            else{
//                return res.status(404).json({
//                    error:"CustomAlias already exist for other Link."
//                });
//            }
//        }
        const result = await createShortUrl(newUrl, CustomAlias, expiresAt, userId);
//        console.log(req.host);
        return res.status(201).json({
            shortUrl: `${process.env.BASE_URL}/${result.shortCode}`,
            shortCode: result.shortCode,
            OriginalUrl: result.originalUrl,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            error: 'Internal Server Error',
        });
    }
}


async function redirectUrl(req, res){
        try{
            const { code } = req.params;

            let urlEntry = await getCachedUrl(code);

            if(!urlEntry){
                console.log("Cache Miss - Entering to Lock System");

                await mutex.runExclusive(async() =>{
                    urlEntry = await getCachedUrl(code);
                    if(!urlEntry){
                        console.log("Lock Aquired: Querying PostgreSQL safely...");
                        urlEntry = await getOriginalUrl(code);

                        if(urlEntry){
                            console.log("url retrieved from DB, Now Cache updating...")
                            let ttl = 3600;
                            if(urlEntry.expiresAt){
                                const remainingTime = Math.floor(
                                    (new Date(urlEntry.expiresAt) - new Date())/1000
                                );
                                ttl = Math.max(remainingTime,1);
                            }
                            await cacheUrl(code, urlEntry, ttl);
                            console.log("Cache updated.")
                        }
                    }
                });

                if(!urlEntry){
                    return res.status(404).json({
                        error: 'Short Url not found.'
                    });
                }
            }
            else{
                console.log("Cache Hit.");
            }

            if(urlEntry.expiresAt && new Date() > new Date(urlEntry.expiresAt)){
                return res.status(410).json({
                    error: 'Short url expired!',
                });
            }
//            console.log(code);
//            console.log(req.ip);
//            console.log(req.headers['user-agent']);
//            console.log(req.headers.referrer || null);
//            console.log(req.url);
//            console.log(req.host);
            analyticsQueue.add(
                'trackClick',
                {
                    shortCode: code,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    referrer: req.headers.referrer || null,
                    urlId: urlEntry.id,
                },
                {
                    attempts: 3,
                    backoff:{
                        type: 'exponential',
                        delay: 1000,
                    },
                }
            );

//            console.log("analyticsQueue passed.");

            return res.redirect(302, urlEntry.originalUrl);
        }catch(error){
            console.error("Redirection pipeline execution crash:", error);
            return res.status(500).json({
                error:'Internal server error.'
            });
        }
 }

 async function getUrls(req,res){
    try{
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page-1)*limit;
        const status = req.query.status ||'all';
        const sortBy = req.query.sortBy || 'recent';
        const now =  new Date();

        const whereClause = {
            userId: req.user.userId,
            originalUrl:{
                contains: search,
                mode: 'insensitive',
            },
        };
        if(status === 'active'){
            whereClause.OR = [
                {expiresAt: null},
                {expiresAt: {gt: now} }
            ];
        }else if(status === 'expired'){
            whereClause.expiresAt = {lt: now};
        }

        // 2. Build Dynamic Sorting
        let orderByClause = { createdAt: "desc" };
        if (sortBy === 'oldest') {
            orderByClause = { createdAt: "asc" };
        } else if (sortBy === 'most_clicked') {
            orderByClause = { clickEvents: { _count: "desc" } };
        } else if (sortBy === 'least_clicked') {
            orderByClause = { clickEvents: { _count: "asc" } };
        }

        const urls = await prisma.url.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { clickEvents: true }
                }
            },
            orderBy: orderByClause,
            skip,
            take: limit,
        });

        const total = await prisma.url.count({
            where: whereClause,
        });
        return res.json({
            urls,
            total,
            page,
            totalPages: Math.ceil(total/limit),
        });
    }catch(error){
        console.error('[getUrls error]', error);
        return res.status(500).json({
            error: 'Internal Server Error.',
        });
    }
 }

 async function deleteUrl(req,res){
    try{
        const { id } = req.params;
        const url = await prisma.url.findUnique({
            where:{
                id: Number(id),
            },
        });

        if(!url || url.userId !== req.user.userId){
            return res.status(404).json({
                error: "url not found.",
            });
        }

        await prisma.url.delete({
            where:{
                id: Number(id),
            },
        });
        return res.json({
            message: 'URL deleted successfully.',
        });
    }catch(error){
        return res.status(500).json({
            error: 'Internal Server error.',
        });
    }
 }

async function getStats(req, res) {
    try {
        const userId = req.user.userId;
        const now = new Date();
        const weekAgo  = new Date(now - 7  * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

        const [totalLinks, linksThisWeek, linksLastWeek, activeLinks] = await Promise.all([
            prisma.url.count({ where: { userId } }),
            prisma.url.count({ where: { userId, createdAt: { gte: weekAgo } } }),
            prisma.url.count({ where: { userId, createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
            prisma.url.count({
                where: {
                    userId,
                    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
                },
            }),
        ]);


          const [ totalClicks, clicksThisWeek, clicksLastWeek ] = await Promise.all([
                prisma.clickEvent.count({ where: { url: { userId }}}),
                prisma.clickEvent.count({ where: { url: { userId }, clickedAt: { gte: weekAgo }}}),
                prisma.clickEvent.count({ where: {url: {userId }, clickedAt: { gte: twoWeeksAgo, lt: weekAgo}}}),
          ]);

        return res.json({
            totalLinks,
            linksThisWeek,
            linksLastWeek,
            totalClicks,
            clicksThisWeek,
            clicksLastWeek,
            activeLinks,
        });
    } catch (error) {
        console.error('[getStats]', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getUrlClicks(req,res){
    try{
        const { id } = req.params;
        const count = await prisma.clickEvent.count({
            where:{
                urlId: Number(id),
                url:{
                    userId: req.user.userId,
                }
            }
        });
        return res.json({ id: Number(id), clickCount: count });
    }catch(error){
        console.error("[getUrlClicks error]: ", error);
        return res.status(500).json({
            error: "Internal Server Error."
        });
    }
}

module.exports = {
    shortenUrl,
    redirectUrl,
    getUrls,
    deleteUrl,
    getStats,
    getUrlClicks,
};

