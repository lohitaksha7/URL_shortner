const connection = require('../queue/redisConnection');

async function getCachedUrl(shortCode){
    const data = await connection.get(`url:${shortCode}`);
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

async function getCachedQR(cacheKey){
    const data = await connection.get(cacheKey);
    if(!data) return null;
    if(cacheKey.endsWith(':svg')) return data;
    return Buffer.from(data, 'base64');
}

async function cacheQR(cacheKey, imageData, ttlSeconds = 86400){
    const valueToStore = Buffer.isBuffer(imageData)
                         ? imageData.toString('Base64')
                         : imageData;
    await connection.set(cacheKey, valueToStore, 'Ex', ttlSeconds);
}

module.exports = {
    getCachedUrl,
    cacheUrl,
    getCachedQR,
    cacheQR,
}