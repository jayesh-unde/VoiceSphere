const Jimp = require('jimp');
const path = require('path');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dtos');

class ActivateController{
    async activate(req,res){
        const {name,avatar} = req.body;
        if(!name || !avatar){
            res.status(400).json({message:'All field are required'});
        }
        // now we need to store image in database
        const buffer = Buffer
        .from(avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),'base64'); // to pass image string of base64
        // we need to compress image size

        const imagePath = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}.png`;

        try{
            const jimpResp = await Jimp.read(buffer);
            jimpResp
            .resize(150,Jimp.AUTO)
            .write(path.resolve(__dirname,`../storage/${imagePath}`)); // not affect the aspect ratio given by the user

        }catch(err){
            res.status(500).json({message:'could not process the image'});
        }
        const userId = req.user._id;
        // Update user
        try {
            const user = await userService.findUser({ _id: userId });
            if (!user) {
                res.status(404).json({ message: 'User not found!' });
            }
            user.activated = true;
            user.name = name;
            user.avatar=`/storage/${imagePath}`;
            user.save();
            res.json({ user: new UserDto(user), auth: true });
        } catch (err) {
            res.status(500).json({ message: 'Something went wrong!' });
        }
    }
}
module.exports  = new ActivateController();