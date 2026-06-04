const { generateQR, generateBarcode } = require('../services/qrServices');
const { getCachedQR, cacheQR} = require('../cache/cacheService');
const prisma = require('../db/prisma');

async function getQRCode(req,res){
    try{
        const { code } = req.params;
        const format = req.query.format || 'png';
        const size = Math.min(Number(req.query.size) || 300, 1000);
        const color = (req.query.color || '000000').replace('#','');
        const bg         = (req.query.bg    || 'ffffff').replace('#', '');
        const download   = req.query.download === 'true';

        const cacheKey = `qr:${code}:${size}:${format}:${color}:${bg}`;

        const cached = await getCachedQR(cacheKey);
        if(cached) return sendImage(res, cached, format, download);

        const urlEntry = await prisma.url.findUnique({
            where:{ shortCode: code}
        });

        if(!urlEntry){
            return res.status(404).json({
                error: "short Code not found",
            });
        }

        const shortUrl = `${process.env.BASE_URL}/${code}`;
        const imageData = await generateQR(shortUrl, {size, format, color, bg});

        await cacheQR(cacheKey, imageData);
        return sendImage(res,imageData, format, code, download);
    }catch(error){
        console.error('[getQRCode]: ', error);
        return res.status(500).json({ error: 'Failed to generate QR code.' });
    }
}

async function getBarcode(req,res){
    try{
        const { code } = req.params;
        const scale    = Math.min(Number(req.query.scale)  || 3,  10);
        const height   = Math.min(Number(req.query.height) || 10, 50);
        const download = req.query.download === 'true';
        const cacheKey = `barcode:${code}:${scale}:${height}`;

        const cached = await getCachedQR(cacheKey);   // ← await was missing

        if(cached) return sendImage(res, cached, 'png', code, download, 'barcode');

        const urlEntry = await prisma.url.findUnique({
            where: {shortCode: code}
        });
        if(!urlEntry){
            return res.status(404).json({
               error: "short code not found.",
            });
        }

        const shortUrl  = `${process.env.BASE_URL}/${code}`;
        const pngBuffer = await generateBarcode(shortUrl, {scale, height});

        await cacheQR(cacheKey, pngBuffer);
        return sendImage(res, pngBuffer, 'png', code, download, 'barcode'); // ← 'png' not undefined format
    }catch(error){
        console.error('[getBarcode]: ', error);
        return res.status(500).json({error: "Failed to generate barcode."})
    }
}

function sendImage(res, imageData, format, code, download, type = 'qr'){
    const contentType = format ==='svg' ? 'image/svg+xml' : 'image/png';
    const filename = `${type}-${code}.${format}`;  // ← was $(type), missing {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition',download ? `attachment; filename="${filename}"`:'inline');
    res.setHeader('Cache-Control','public, max-age = 86400');
    return res.send(imageData);
}

module.exports = {
    getBarcode,
    getQRCode,
}