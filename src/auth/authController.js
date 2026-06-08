const {
    registerUser,
    loginUser,
    loginGoogleUser,
} = require('./authService');

async function register(req,res){
    try{
        const { email,password } = req.body;
        if(!email || !password){
            return res.status(400).json({
                error: 'Email and Password required.'
            });
        }
        await registerUser(email,password);

        return res.status(201).json({
            message: 'User registered successfully.'
        });
    }catch(error){
        return res.status(400).json({
            error: error.message,
        });
    }
}

async function login(req,res){
    try{
        const { email, password } = req.body;
        const result = await loginUser(email,password);
        return res.json(result);
    }catch(error){
        return res.status(401).json({
            error: error.message,
        });
    }
}

async function googleAuth(req,res){
    try{
        const { token } = req.body;
        const result = await loginGoogleUser(token);
        return res.json(result);
    }catch(error){
        return res.status(401).json({
            error: error.message,
        });
    }
}

module.exports = {
    register,
    login,
    googleAuth,
};