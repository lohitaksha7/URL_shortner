const connection = require('../queue/redisConnection');


async function getCachedUrl(shortCode){
    const data = await connection.get(`url: ${shortCode}`);
    return data? JSON.parse(data):null;
}

async function cacheUrl(
    shortCode,
    urlData,
    ttlSeconds = 3600
){
    await connection.set(
        `url:${shortCode}`,
        JSON.stringify(urlData),
        'EX',
        ttlSeconds
    );
}

module.exports = {
    getCachedUrl,
    cacheUrl,
}