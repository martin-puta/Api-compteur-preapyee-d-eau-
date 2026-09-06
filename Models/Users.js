// students models datas of users

const mongoose = require("mongoose");
const UsersShema = mongoose.Schema({
    fname :{
        type:String,
        default:"",
        required:true
    },

    lname :{
        type:String,
        default:"",
        required:true
    },
    createAt:{
        type:Number,
        default:Date.now()
    },

    passWord:{
        type:String,
        default:""
    },

    isActive:{
        type:Boolean,
        default: false
    },
    status:{
        type:String,
        default:"ACTIVE"
    },
    socketID:{
        type:String,
        default:null
    },
    useRole:{
        type:String,
        required:true,
    },
    cover:{
        type:String,
        default:null
    },

    //Coordo Datas
    email:{
        type:String,
        unique:true,
        required:true,
    },
    tel:{
        type:String,
        unique:true,
        required:true,
    },
    //Token datas
    ActivationToken:{
        type:String,
        default:null
    },
    idCounter:{
        type:String,
        default:null
    },
    //Admin user datas for Appartements
    adminID:{
        type:String,
        default:null
    },
});

module.exports = mongoose.model("User", UsersShema);
