const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const Userdto = require('../dtos/user-dtos');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('666111852320-5sj0b6062nugsnud81uqd2eglomlri15.apps.googleusercontent.com');


function generateRandomPassword(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

class AuthController {
    async sendOtp(req, res) {
        const { phone } = req.body;
        if (!phone) {
            res.status(400).json({ message: 'Phone field is required!' });
        }

        const otp = await otpService.generateOtp();

        const ttl = 1000 * 60 * 2; // 2 min
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // send OTP
        try {
            // await otpService.sendBySms(phone, otp);
            res.json({
                hash: `${hash}.${expires}`,
                phone,
                otp,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'message sending failed' });
        }
    }
    async sendOtpEmail(req, res) {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'email field is required!' });
        }

        const otp = await otpService.generateOtp();

        const ttl = 1000 * 60 * 2; // 2 min
        const expires = Date.now() + ttl;
        const data = `${email}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // send OTP
        try {
            await otpService.sendByEmail(email, otp);
            res.json({
                hash: `${hash}.${expires}`,
                email,
                otp,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'message sending failed' });
        }
    }

    async findUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
    
        let user;
        let isValid = false;
        try {
            user = await userService.findUser({ email: email });
            if (user) {
                isValid = await userService.findPassword(email, password);
            }
            res.json({ user: user, isValid: isValid });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Db error' });
        }
    }

    async findUserData(req, res) {
        const { username:name } = req.body;
    
        let user;
        try {
            user = await userService.findUser({ name });
            res.json({ user: user});
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Db error' });
        }
    }
    async loginEmail(req,res){
        const {email} = req.body;
        let user = await userService.findUser({ email: email });
        const { accessToken, refreshToken } = tokenService.generateTokens({
            _id: user._id,
        });
        console.log(accessToken);
        await tokenService.storeRefreshToken(refreshToken,user._id);

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None' // Allow cross-site cookies

        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None' // Allow cross-site cookies

        });

        const userdto = new Userdto(user);
        res.json({user:userdto , auth: true});
    }
    async verifyOtp(req, res) {
        const { otp, hash, email,password } = req.body;
        if (!otp || !hash || !email || !password) {
            res.status(400).json({ message: 'All fields are required!' });
        }

        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            res.status(400).json({ message: 'OTP expired!' });
        }

        const data = `${email}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);
        if (!isValid) {
            res.status(400).json({ message: 'Invalid OTP' });
        }

        let user;
        try {
            // Try to find the user by email
            user = await userService.findUser({ email: email });
            if (!user) {
                // If user doesn't exist, create a new one with hashed password
                user = await userService.createUser({ email: email, password: password });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: 'DB error' });
        }

        const { accessToken, refreshToken } = tokenService.generateTokens({
            _id: user._id,
            activated: false,
        });
        console.log(accessToken);
        await tokenService.storeRefreshToken(refreshToken,user._id);

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None' // Allow cross-site cookies

        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None' // Allow cross-site cookies

        });

        const userdto = new Userdto(user);
        res.json({user:userdto , auth: true});
    }
    async refresh(req, res) {
        // Get refresh token from cookie
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        if (!refreshTokenFromCookie) {
            return res.status(401).json({ message: 'No token provided' });
        }
    
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token haa' });
        }
    
        // Check if the token is in the database
        try {
            const token = await tokenService.findRefreshtoken(userData._id, refreshTokenFromCookie);
            if (!token) {
                return res.status(401).json({ message: 'Invalid token naa' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
    
        // Check if the user is valid
        const user = await userService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ message: 'Invalid user' });
        }
    
        // Generate new tokens
        const { accessToken, refreshToken } = tokenService.generateTokens({ _id: userData._id });
    
        // Update refresh token in the database
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }
    
        // Set cookies for the new tokens
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None' // Allow cross-site cookies

        });
    
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None' // Allow cross-site cookies

        });
    
        const userDto = new Userdto(user);
        res.json({ user: userDto, auth: true });
    }
    
    async googleLogin(req, res) {
        const { token } = req.body;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: '666111852320-5sj0b6062nugsnud81uqd2eglomlri15.apps.googleusercontent.com',
            });
            const payload = ticket.getPayload();
            const { sub, email, name } = payload;

            let user = await userService.findUser({ email });

            if (!user) {
                const randomPassword = generateRandomPassword(20);
                user = await userService.createUser({ googleId: sub, email, name, password: randomPassword });
                const { accessToken, refreshToken } = tokenService.generateTokens({ _id: user._id });

                await tokenService.storeRefreshToken(refreshToken, user._id);

                res.cookie('refreshToken', refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None'
                });

                res.cookie('accessToken', accessToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None'
                });

                const userDto = new Userdto(user);
                return res.status(201).json({ user: userDto, auth: true, message: 'User created and logged in' });
            } else {
                const { accessToken, refreshToken } = tokenService.generateTokens({ _id: user._id });

                await tokenService.storeRefreshToken(refreshToken, user._id);

                res.cookie('refreshToken', refreshToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None'
                });

                res.cookie('accessToken', accessToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        domain: 'voicesphere.onrender.com', // Frontend domain
        sameSite: 'None'
                });

                const userDto = new Userdto(user);
                return res.status(200).json({ user: userDto, auth: true, message: 'User logged in' });
            }
        } catch (error) {
            console.error('Google login failed:', error);
            res.status(401).json({ message: 'Google login failed' });
        }
    }
    // logout 

    async logout(req,res){
        // delete refresh token from db
        const {refreshToken} = req.cookies;
        await tokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({user:null,auth:false});
    }
}

module.exports = new AuthController();
