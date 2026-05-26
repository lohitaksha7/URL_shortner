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
        const { url, customAlias, expiresAt, userId } = req.body;
        if(!url||!validator.isURL(url)){
            return res.status(400).json({
                error: 'Valid URL is required.',
            })
        }
//        const userId = req.user.userId;
        const result = await createShortUrl(url, customAlias, expiresAt, userId);

        return res.status(201).json({
            shortUrl: `${process.env.BASE_URL}/${result.shortCode}`,
            shortCode: result.shortCode,
            OriginalUrl: result.originalUrl,
        });
    }catch(error){
        console.log(error);
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
//                    else{
//                         console.log("Cache was updated while waiting line! DB query skipped.");
//                    }
                });

                if(!urlEntry){
                    return res.status(404).json({
                        error: 'Short Url not found.'
                    });
                }
            }else{
                console.log("Cache Hit.");
            }

            if(urlEntry.expiresAt && new Date() > new Date(expiresAt)){
                return res.status(410).json({
                    error: 'Short url expired!',
                });
            }

            analyticsQueue.add(
                'track-click',
                {
                    shortCode: code,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    referrer: req.headers.referrer||null,
                },
                {
                    attempts: 3,
                    backoff:{
                        type: 'exponential',
                        delay: 1000,
                    },
                }
            );

            return res.redirect(302, urlEntry.originalUrl);
        }catch(error){
            console.error(error);

            return res.status(500).json({
                error:'Internal server error.'
            });
        }
 }

 async function getUrls(req,res){
    try{
        const urls = await prisma.url.findMany({
            where:{
                userId: req.user.userId,
            },
            orderBy:{
                createdAt: "desc",
            },
        });
        return res.json(urls);
    }catch(error){
        return res.status(500).json({
            error: 'Internal Server Error.',
        });
    }
 }

module.exports = {
    shortenUrl,
    redirectUrl,
    getUrls,
};

