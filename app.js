
// include connect mongoose to cluster mangodb
require("./Utils/db/mongo_db");

const express = require('express');
const app = express();  // methode express

//Routes 
const testRoute = require('./Routes/test');
const AuthRoute = require("./Routes/Authentification");
const CheckAuthUser = require("./Routes/Authentification/Auth");
const SearchUserRoute = require("./Routes/Users")
const AppUserRoute = require("./Routes/AppUser")
const AdminUserRoute = require("./Routes/Admin")
const EspRoute = require("./Routes/Esp")
const CounterRoute = require("./Routes/Counter")

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUSH');
    next();
});

app.use('/test', testRoute); // router checking if remote server runing
app.use('/AuthUser', CheckAuthUser);
app.use('/Authentification', AuthRoute);

// userRoutes
app.use("/Admin",AdminUserRoute);
app.use("/AppUsers", AppUserRoute);
app.use("/Users",SearchUserRoute);
app.use("/Esp8266",EspRoute);
app.use("/Counter",CounterRoute);


module.exports = app;
