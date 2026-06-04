const QRcode = require('qrcode');
const bwipjs = require('bwip-js');

async function generateQR(shortUrl, options={}){
    const { size = 300, format = 'png', color = '000000', bg = 'ffffff' } = options;

    const qrOptions = {
        width : size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: `#${color}`, light: `#${bg}` },
    };
    if(format == 'svg'){
        return await QRcode.toString(shortUrl,{...qrOptions, type: 'svg'});
    }
    return await QRcode.toBuffer(shortUrl,{...qrOptions, type: 'png'});
}

async function generateBarcode(shortUrl, options = {}){
    const { scale = 3, height = 10 } = options;

    return new Promise((resolve,reject)=>{
        bwipjs.toBuffer(
            {
                bcid: 'code128',
                text: shortUrl,
                scale,
                height,
                includetext: false,
            },
            (err,png) => {
                if(err) return reject(err);
                resolve(png);
            }
        );
    });
}

module.exports = {
    generateBarcode,
    generateQR,
}