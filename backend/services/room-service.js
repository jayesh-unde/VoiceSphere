const RoomModel = require("../models/room-model");

class roomService{
    async create(payload){
        const {topic,roomType,ownerId} = payload;
        const room = await RoomModel.create({
            topic,
            roomType,
            ownerId,
            speakers:[ownerId],
        });
        return room;
    }
    async getAllRooms(types) {
    const rooms = await RoomModel.find({
        roomType: { $in: types },
        speakers: { $ne: [] }, // Ensure speakers array is not empty
    })
    .populate('speakers')
    .populate('ownerId')
    .exec();
    return rooms;
}

    async getRoom(roomId) {
        const room = await RoomModel.findOne({ _id: roomId });
        return room;
    }
    async deleteRoom(roomId) {
        try {
            await RoomModel.deleteOne({ _id: roomId });
            console.log(`Room ${roomId} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting room ${roomId}:`, error);
        }
    }
    async removeAllParticipants(roomId) {
        try {
            const room = await RoomModel.findById(roomId);
            if (room) {
                // Notify all participants
                const participants = room.speakers; // assuming speakers are the participants
                participants.forEach(participantId => {
                    this.sendNotification(participantId, 'The owner has left the room. The room is now closed.');
                });

                // Remove all participants from the room
                room.speakers = [];
                await room.save();
                console.log(`All participants removed from room ${roomId}`);
            }
        } catch (error) {
            console.error(`Error removing participants from room ${roomId}:`, error);
        }
    }

}
module.exports = new roomService();