
const jwt = require("jsonwebtoken");

// modelsusers 
const modelOfUsers = require("../../Models/Users"); // import model of students user

// controller Check Auth user
exports.CheckAuthUser =(req, res)=>{
    let token = req.headers.autorization;
    token = token.split(" ")[1];

    try{
        // verify validity token 
        const DataOfToken = jwt.verify(token, process.env.TOKEN_SIGN);

        // search user in dataBase
        modelOfUsers.findOne({_id:DataOfToken.idUser})
        .then(userFund =>{
            res.status(200).json({msg:"Token valid", userFund});
        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({error});
        })
    }
    catch(error){
        console.log(error.message);
        res.status(401).json({error});
    };
};