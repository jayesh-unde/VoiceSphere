class Userdto{
    id;
    phone;
    activated;
    created_at;
    constructor(user){
        this.id = user._id;
        this.phone = user.phone;
        this.activated = user.activated;
        this.created_at = user.created_at;
    }
}
module.exports = Userdto;