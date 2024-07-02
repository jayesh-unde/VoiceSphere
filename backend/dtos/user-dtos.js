class Userdto{
    id;
    email;
    activated;
    created_at;
    name;
    avatar;
    constructor(user){
        this.id = user._id;
        this.email = user.email;
        this.activated = user.activated;
        this.created_at = user.created_at;
        this.name = user.name;
        this.avatar = user.avatar;
    }
}
module.exports = Userdto;