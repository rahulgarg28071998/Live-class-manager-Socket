const mongoose  = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: String,
        socketId : String,
        role : {
            type :   String,
            required: true
        }
    }
)

module.exports = mongoose.model("User" , UserSchema)