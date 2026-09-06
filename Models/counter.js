//Counter model datas of users

const mongoose = require("mongoose");
const CounterShema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    AdminId:{
        type:String,
        required:true,
    },
    socketId:{
        type:String,
        default:null
    },
    userId:{
        type:String,
        required:true
    },

    idCounter:{
        type:Number,
        unique:true,
        required:true
    },
    newPayement:{
        type:Boolean,
        default:false
    },
    counterValue:{
        type:Number,
        default:0.0
    },
    TotalCounterValue:{
        type:Number,
        default:0.0
    },
    TotalPayementValue:{
        type:Number,
        default:0.0
    },
    speedCounter:{
        type:Number,
        default:0.0
    },
    isActive:{
        type:Boolean,
        default:false
    },
});

module.exports = mongoose.model("counter", CounterShema);
