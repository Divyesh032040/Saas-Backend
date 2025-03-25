

const crypto = require('crypto')



class OtpService {
    
    //generate opt
    OtpGenerate(){
    const otp = crypto.randomInt(1000, 10000);
    return otp;
    }

    hashOtp(data){

        const otpData = data.toString();

        const hashedOtp =  crypto.createHmac('sha256', process.env.HASH_SECRET).update(otpData).digest('hex');

        console.log(hashedOtp);

        return hashedOtp;

    }

    verifyOtp(hashedOtp, data) {
        if (!hashedOtp || !data) {
            throw new Error("Failed to verify OTP");
        }

        const otpData = data.toString();

        const checkHashed =  crypto.createHmac('sha256', process.env.HASH_SECRET).update(otpData).digest('hex');

        const newComputedHash = checkHashed;
    
        // Return the result of the comparison directly
        return newComputedHash === hashedOtp;
    }

}

module.exports = new OtpService()