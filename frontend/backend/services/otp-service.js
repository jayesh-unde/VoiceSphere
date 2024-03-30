const crypto = require('crypto');
const hashService = require('./hash-service');
const smsSid = process.env.SMS_SID;
const smsAuth = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid,smsAuth,{
    lazyLoading:true
})
class OtpService{
    async generateOtp(){
        const otp = crypto.randomInt(1000,9999);
        return otp;
    }
    async sendBySms(phone,otp){
        return await twilio.messages.create({
            to:phone,
            from:process.env.SMS_FROM_NUMBER,
            body:`Your otp for Voicespher is ${otp}`,
        }       
        )
    }
    verifyOtp(hashOtp,data){
        let computedHash = hashService.hashOtp(data);
        if(computedHash===hashOtp){ // check whether otp is valid or not
            return true;
        }
        return false;
    }
}
module.exports = new OtpService();