const express = require('express');
const router = express.Router();
const authenticate = require('./authMiddleware')
const { authLimiter } = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/captchaMiddleware');

const{
    register,
    login,
    googleAuth,
} = require('./authController');

router.post('/register', authLimiter, verifyCaptcha, register);
router.post('/login', authLimiter, verifyCaptcha, login);
router.post('/google', authLimiter, googleAuth);

router.get(
    '/me',
    authenticate,
    async (req,res)=>{
        return res.json({
           user: req.user,
        });
    }
);

module.exports = router;
