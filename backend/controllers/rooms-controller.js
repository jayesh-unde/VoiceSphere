const roomService = require("../services/room-service");
const RoomDto = require("../dtos/room-dtos");


class roomsController{
    async create(req,res){
        const {topic,roomType} = req.body;
        if(!topic || !roomType){
            return res.status(400).json({message:'all field are required'});
        }
        const room = await roomService.create({
            topic,
            roomType,
            ownerId: req.user._id,
        });
        return res.json(new RoomDto(room));
    }
    async index(req,res){
        const rooms = await roomService.getAllRooms(['open']);
        const allRooms = rooms.map(room=> new RoomDto(room));
        return res.json(allRooms);
    }
    async show(req, res) {
        const room = await roomService.getRoom(req.params.roomId);

        return res.json(room);
    }
    async leaveRoom(req,res){
        const { roomId, userId } = req.body;

        try {
            const room = await roomService.getRoom(roomId);
    
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }
    
            if (room.ownerId.toString() === userId) {
                // User is the owner, delete the room
                await roomService.removeAllParticipants(roomId);
                await roomService.deleteRoom(roomId);
                return res.json({ success: true, message: 'Room deleted' });
            } else {
                // User is not the owner, just leave the room
                return res.json({ success: true, message: 'Left the room' });
            }
        } catch (error) {
            console.error('Error leaving the room', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}
module.exports = new roomsController();