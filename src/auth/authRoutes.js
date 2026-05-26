const express = require('express');
const router = express.Router();
const authenticate = require('./authMiddleware')
const { authLimiter } = require('../middleware/rateLimiter');

const{
    register,
    login,
} = require('./authController');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
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
