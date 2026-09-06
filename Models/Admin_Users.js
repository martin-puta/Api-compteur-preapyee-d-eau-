//Admin model datas of users

const mongoose = require("mongoose");
const UsersAdminShema = mongoose.Schema({
    name :{
        type:String,
        default:"ROOT User"
    },
    password:{
        type:String,
        default:""
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    socketId:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true
    }
});

module.exports = mongoose.model("admin", UsersAdminShema);
