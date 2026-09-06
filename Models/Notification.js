//Admin model datas of users

const mongoose = require("mongoose");
const NotificationShema = mongoose.Schema({
    receiverId:{
        type:mongoose.Types.ObjectId,
        required:true,
    },
    message:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    AdminId:{
        type:String,
        required:true
    },
    idCounter:{
        type:Number,
        required:true
    },
    createAt:{
        type:Number,
        default:Date.now()
    },
});

module.exports = mongoose.model("notification", NotificationShema);
