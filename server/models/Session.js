
const mongoose  = require('mongoose');

const SessionSchema = new mongoose.Schema(
    {
        //id has 
        name:{
            type:String,
            required : true
        },
        isStarted : {
            type:Boolean,
            default:true
        },
        teacher: {
            teacherId: {
               type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            entryTime : { type : Date, default: Date.now }
            // exitTime : { type : Date, default: Date.now }
        },

        students : [{
            studentId: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
            entryTime : { type : Date, default: Date.now },
            exitTime : { type : Date, default: Date.now }
        }],
        startTime : { type : Date, default: Date.now },
        endTime : { type : Date, default: Date.now }

    }
)




module.exports = mongoose.model("Classroom" , SessionSchema)