
// modelsusers 
const modelOfUsers = require("../Models/Users"); // import model of students user
const modelOfAdminUsers = require("../Models/Admin_Users"); // import model of students user

//Lib
require("dotenv").config();
const bcrypt = require("bcrypt"); // salting password Methode
const jwt = require("jsonwebtoken");

exports.AdminLogin = (req, res) => {
    // Checking email 
    console.log(req.body);
    modelOfAdminUsers.findOne({$or:[{email:req.body.email}]})
            .then(userFund =>{
                if(userFund === null){
                    res.status(401).json({msg:"Aucun Utilisateur Trouvé avec ces Identités"}) 
                }

                else{
                        bcrypt.compare(req.body.passWord, userFund.passWord)
                        .then(valid =>{
                            if(!valid){
                                res.status(401).json({msg:"email ou mot de pass d'utilisateur Incorrect"})  
                            }

                            else{
                            const Token = jwt.sign({
                                    idUser:userFund._id,
                                    mail:userFund.email,
                                },process.env.TOKEN_SIGN);
                                res.status(200).json({msg:"Utilisateur trouvé", Token, DataUser:userFund, typeAccount:userFund.typeAccount});
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).json({msg:"Error Server Token"})
                        }
                            )
                     
                }
            })
            .catch(error =>{
                 console.log(`Error Database ${error}`) // if Error  Connexion to dataBase
                 res.status(500).json({msg:"Erreur server"}) 
              });
};

// controller Check Auth user
exports.deleteUser =(req, res)=>{
        //search user in dataBase
        modelOfUsers.deleteOne({_id:req.params.id})
        .then((userFund) =>{
            console.log("user deleted");
            console.log(userFund);
            res.status(200).json("user Deleted");

        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({error});
        })        
};

exports.getAllUsers =(req, res)=>{

        //search AllStudents in dataBase
        modelOfUsers.find({idOfAdmin: req.Autorization.userId})
        .then(userFund =>{
                res.status(200).json({msg:"Tout les utilisateurs du reseau", AllUsers:userFund});
            
        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({error});
        })        
};


exports.NewUser =(req, res)=>{
    modelOfUsers.find({idOfAdmin: req.Autorization.userId})
    .then(userFund =>{
        const formDatas ={
            email:req.body.email,
            tel:req.body.tel,
            name:`${req.body.SecondeName} ${req.body.name}`,
            idOfAdmin:req.Autorization.userId,
            idCompteur:userFund.length+1
        }
        //create new user in dataBase
        const user = new modelOfUsers(formDatas)
        user.save()
        .then(() =>{
                res.status(200).json({msg:"Creation d'utilisateur reussit"});
        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({msg:"cet adresse mail ou cet numero existe deja dans la base de donnee, veuillez rensignez un autre!"});
        }) 
    })
    .catch(error =>{
        console.log(error);
        res.status(500).json({msg: "Error server"});
    });
       
};
