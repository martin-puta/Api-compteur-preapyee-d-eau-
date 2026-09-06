
const jwt = require("jsonwebtoken");

// modelsusers 
const modelUser = require("../../Models/Users"); // import model of  user

// controller Check Auth user
exports.CheckAutorizationUser =(req, res, next)=>{
    console.log(req.headers);
    let token = req.headers.authorization;
    console.log(token);

    if(!token){
        //invalid Token
        console.log("token Invalid");
        res.status(401);
        res.json({msg: "Echec, Token invalid"});
    }

    else{
        try{
        // verify validity token 
        token = token.split(" ")[1];
        const DataOfToken = jwt.verify(token, process.env.TOKEN_SIGN);

        // search user in dataBase
        modelUser.findOne({_id:DataOfToken.idUser})
        .then(userFund =>{
            console.log(userFund);
                req.Autorization ={
                ...userFund
                }
            next();
        })
        .catch(error =>{
            console.log(error);
            res.status(401).json({error});
        })
    }
    catch(error){
        console.log(error.message);
        res.status(401).json({error});
    };
    }
    
};