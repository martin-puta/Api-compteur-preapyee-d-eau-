
//point d'entree de mon app
const {createServer} = require('http');
const {Server} = require("socket.io");
const app = require('./app');


const normalPort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }
    return false;
};



const port = normalPort(4002);

app.set('port', port);
const httpServer = createServer(app); // Express Server

//Socket Server
const socketOptions ={ //socket server options
    cors:{
        origin:"*"
    }
}
const io = new Server(httpServer, socketOptions);

//Handles Manage Connection User

const onDisconnect = (socket)=>{
    console.log("User disconnected");
}
const onConnection = (socket)=>{
    console.log("User Connected");

    // display sockets datas 
    console.log("id Socket : ");
    console.log(socket.id);
    
    console.log("Socket Head and Auth datas: ");
    console.log(socket.handshake.headers);
    console.log(socket.handshake.auth);

    //socket Events datas
    socket.on("disconnect",(socket)=> onDisconnect(socket));
}

//SOCKETS EVENTS
io.on("connection",(socket)=>onConnection(socket)) 

httpServer.listen(port);
