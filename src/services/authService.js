const jwt = require('jsonwebtoken');
const logger = require("../logger")

//generate accessToken 
 function generateAccessToken (payload) {

    if(!payload){
        throw new Error("payload is required")
    }
    try {
        const accessTokens =  jwt.sign(payload , process.env.JWT_SECRET, {  expiresIn: '7d' });
        return accessTokens;
    } catch (error) {
        console.log(error);
    }
}


//generate refreshToken
function generateRefreshToken(payload){
    if(!payload){
        throw new Error("payload is required")
    }
    try {
        const refreshToken =  jwt.sign(payload ,process.env.JWT_SECRET , {expiresIn:'1y'});
        return refreshToken;
    } catch (error) {
        console.log(error);
    }
}

//verify tokens and return payload
function verifyToken (userToken){
    if(!userToken){
        throw new Error("Invalid input : token is required");
    }
    try {
        const payload = jwt.verify(userToken , process.env.JWT_SECRET);
        return payload;
    } catch (error) {
        console.log(error);
    }
}

//deleteToken from database 
async function deleteToken(collection , token){
    if(!collection || !token){
        throw new Error("Invalid input : collection and token both are required");
    }
        try {
            const response = await collection.deleteOne({token:token});
            return response;
        } catch (error) {
            console.log(error);
        }
}


 // Update Refresh Token in Database
async function updateRefreshToken(userId, refreshToken){
    if(!userId || !refreshToken){
        throw new Error("Invalid input : userId and refreshToken both are required");
    }
    try {
        const updatedToken = await Token.updateOne(
            { userId },
            { refreshToken: refreshToken }
        );
        return updatedToken.nModified > 0 ? "Token updated successfully" : "No token updated";
    } catch (error) {
        console.error("Error updating token:", error.message);
        throw new Error("Could not update token");
    }
}


async function tokenWithExpiry(payload){

    try {
        const token = jwt.sign(
            payload , 
            process.env.JWT_SECRET, 
            { expiresIn: '60m' } 
        );
    
        return token;
    } catch (error) {
        logger.error("error while generate a token with expiry " , error)
    }

}







module.exports = {
    generateAccessToken,
    generateRefreshToken, 
    verifyToken , 
    deleteToken , 
    updateRefreshToken , 
    tokenWithExpiry
    
    
}








