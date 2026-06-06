const prisma = require('../db/prisma');
const crypto = require('crypto');
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generationNanoId(length){
    const bytes = crypto.randomBytes(length);
    let result = '';
    for(let i=0;i<length;i++){
        result += ALPHABET[bytes[i] % 62];
    }
    return result;
}

async function createShortUrl(originalUrl, customAlias, expiresAt, userId){
    if(customAlias){
        const existing = await prisma.url.findUnique({
           where: {
                shortCode: customAlias,
           },
        });

        if(existing){
            throw new Error('Custom alias already exists!');
        }


        return prisma.url.create({
           data: {
                originalUrl,
                shortCode: customAlias,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                userId,
           },
        });
    }
//    const existing = await prisma.url.findFirst({
//        where:{
//            originalUrl,
//            userId,
//        }
//    });
//    if(existing){
//        console.log(existing);
//        return existing;
//    }

    let attempts = 0;
    const maxAttempts = 3;
    while(attempts<maxAttempts){
        const shortCode = generationNanoId(6);

        try{
            return await prisma.url.create({
                data:{
                    originalUrl,
                    shortCode,
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    userId,
                }

            });
        }catch(error){
            if(error.code === 'P2002' && error.meta?.target?.includes('shortCode')){
                attempts++;
                console.warn(`ShortCode collision detected, Retrying ${attempts}/${maxAttempts}`);
                continue;
            }
            throw error;
        }
    }
    throw new Error('Server was unable to generate short links currently, Please try again.');
}

async function getOriginalUrl(shortCode){
      return prisma.url.findUnique({
            where : {
                shortCode,
            }
      });
}

module.exports = {
    createShortUrl,
    getOriginalUrl,
};

