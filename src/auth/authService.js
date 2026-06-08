const prisma = require('../db/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
//const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken){
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
}

async function registerUser(email,password){
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        }
    });

    if(existingUser){
        throw new Error('User already exists.');
    }

    const hashPassword = await bcrypt.hash(password,10);
    const user = await prisma.user.create({
        data:{
            email,
            password: hashPassword,
        },
    });

    return user;
}

async function loginUser(email,password){
    const user = await prisma.user.findUnique({
        where:{
            email,
        },
    });
    if(!user){
        throw new Error("Invalid credentials (or) Need to Register.");
    }
    const isMatch  = await bcrypt.compare(
        password,
        user.password
    );
    if(!isMatch){
        throw new Error("Invalid Credentials")
    }
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}

async function loginGoogleUser(googleToken) {
    const payload = await verifyGoogleToken(googleToken);
    const { email } = payload;

    let user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
            },
        });
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}

module.exports = {
    registerUser,
    loginUser,
    verifyGoogleToken,
    loginGoogleUser,
};