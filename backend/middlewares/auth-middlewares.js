const tokenService = require("../services/token-service");

module.exports = async function(req,res,next){
    try{
        console.log("champion");
        const {accessToken} = req.cookies; // install cookie-parser 
        if(!accessToken){
            throw new Error();
        }
        console.log("champion");
        console.log(accessToken);
        const userData = await tokenService.verifyAccessToken(accessToken); 
        console.log(userData);
        if(!userData){
            throw new Error();
        }
        req.user = userData;
        next();// when all is Ok proceed to next requests
    }catch(err){
        res.status(401).json({message:'Invalid token welcome'});
    }
    
};
