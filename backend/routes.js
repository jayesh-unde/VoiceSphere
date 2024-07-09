const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const router = require('express').Router(); // we created express router with the help of this
const authMiddlewares = require('./middlewares/auth-middlewares');
const roomsController = require('./controllers/rooms-controller');

router.post('/api/send-otp',authController.sendOtp);
router.post('/api/verify-otp',authController.verifyOtp);
router.post('/api/activate',authMiddlewares,activateController.activate);
router.get('/api/refresh',authController.refresh);
router.post('/api/logout',authMiddlewares,authController.logout);
router.post('/api/rooms',authMiddlewares,roomsController.create);
router.get('/api/rooms',authMiddlewares,roomsController.index);

router.get('/api/rooms/:roomId', authMiddlewares, roomsController.show);
router.post('/api/find-user',authController.findUser);
router.post('/api/profile',authController.findUserData);
router.post('/api/send-otp-email',authController.sendOtpEmail);
router.post('/api/login-email',authController.loginEmail);
router.post('/api/leave-room',authMiddlewares,roomsController.leaveRoom);
router.post('/api/google-login', authController.googleLogin)

module.exports = router;
