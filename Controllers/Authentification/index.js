//Logical Methods for Login and registers routers
// Nodemail configuration
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs")

//Lib and functions
const otp_generator = require("otp-generator");
require("dotenv").config();
const bcrypt = require("bcrypt"); // salting password Methode
const jwt = require("jsonwebtoken");
const SALTE_PWD = 10;

//Models
const modelOfUsers = require("../../Models/Users"); // import model of Others user
const modelOfAdminUsers = require("../../Models/Admin_Users"); // import model of Admin user

//Admin Login Controller
exports.Adminlogin = (req, res) => {
    // Checking if email of user is Valid
    const InAuthorizationMsg = "email ou mot de pass d'utilisateur Incorrect";
    console.log(req.body);
    modelOfAdminUsers.findOne({email:req.body.email})
            .then(userFund =>{
                if(userFund === null){
                    res.status(401).json({msg:InAuthorizationMsg}) 
                }
                else{
                    console.log(userFund);
                        bcrypt.compare(req.body.password, userFund.password)
                        .then(valid =>{
                            if(!valid){
                                res.status(401).json({msg:InAuthorizationMsg})  
                            }

                            else{
                                // Creation Token of user
                            const Token = jwt.sign({
                                    idUser:userFund._id,
                                    mail:userFund.email,
                                },process.env.TOKEN_SIGN);
                                // respond Client
                                res.status(200).json({msg:"Utilisateur trouvé", Token, DataUser:userFund, typeAccount:userFund.typeAccount});
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).json({msg:"Error Server Token"})
                        });                    
                }
            })
            .catch(error =>{
                 console.log(`Error Database ${error}`) // if Error  Connexion to dataBase
                 res.status(500).json({msg:"Erreur server"}) 
              });
};

//Other user Login Controllers
exports.login = (req, res) => {
    const InAuthorizationMsg = "email ou mot de pass d'utilisateur Incorrect";
    const messageInactifAccount = "Ce Compte n'est pas encore Activé";

    // cheking type of Account
    modelOfUsers.findOne({email:req.body.email})
            .then(userFound =>{
                console.log(userFound);
                if(userFound === null){
                    res.status(401).json({msg:InAuthorizationMsg}) 
                }

                else{
                    if(userFound.isActive){
                        bcrypt.compare(req.body.password, userFound.passWord)
                        .then(valid =>{
                            if(!valid){
                                res.status(401).json({msg:InAuthorizationMsg})  
                            }

                            else{
                                // Create Token
                            const Token = jwt.sign({
                                    idUser:userFound._id,
                                    mail:userFound.email,
                                },process.env.TOKEN_SIGN);
                                res.status(200).json({msg:"Utilisateur trouvé", Token, DataUser:userFound});
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).json({msg:"Error Server Token"})
                        }
                            )
                    }

                    else{
                        res.status(401).json({msg:messageInactifAccount})
                    }  
                }
            })
            .catch(error =>{
                 console.log(`Error Database ${error}`) // if Error  Connexion to dataBase
                 res.status(500).json({msg:"Erreur server"}) 
              });
};

const sendemail = async (name,email, otpCode)=>{
       // option of sending mail
                       // create Transport of nodemail
        const transport = nodemailer.createTransport({
                service:'Gmail',
                    auth:{
                        user:process.env.EMAIL_USER,
                        pass:process.env.EMAIL_PASSWORD
                        }
                    });  

       let mailOptions ={
        from:process.env.EMAIL_USER,
        to:email,
        subject:"Demande d'activation de votre compte sur Smart meter App",
        html:`Cher(e) <b style="font-size:1.2em; color:#227ABD;">${name}</b>, nous avons recu votre demande d'activation de compte chez SMART METER. <p> Votre code est: <b style="font-size:1.5em; color:#00cc00">${otpCode} </b></p> <p>ce code doit rester prive</p>`,
    };

    // Send a email message to user
    return transport.sendMail(mailOptions,(error, infos)=>{
        if(error){
            console.log(`Error : ${error}`)
           return false;
        };
        console.log(`Message sending ${infos}`);
        return true;
    });
}

//get otp code
exports.decodeUserOtp =(req, res, next)=>{
    const idUser = req.body;
    const userNotFoundMsg = "Utilisateur non trouvé";
    
    modelOfUsers.findOne({email: idUser.email})
    .then(userDatas=>{
        if(userDatas){
            // datas user sending
            req.name=`${userDatas.fname} ${userDatas.lname}`;
            req.email=`${userDatas.email}`;
            req.otp= otp_generator.generate(6, { upperCaseAlphabets: false, specialChars: false });
            next();
        }

        else{
            res.status(404).json({msg:userNotFoundMsg}) 
        }
    })
    .catch(error =>{
         console.log(`Error Database ${error}`) // if Error  Connexion to dataBase
         res.status(500).json({msg:"Erreur server"}) 
      });
}
exports.getOpt = async (req, res)=>{
            //save otp code
            modelOfUsers.updateOne({email: req.email},{$set:{
                ActivationToken:req.otp
            }})
            .catch(()=> {
                res.status(500).json({msg:"Erreur server"}) 
            });  

            //send Email
            await sendemail(req.name,req.email, req.otp);
            res.status(201).json({msg:"Success, send otp code"});
}

//Confirm Otp code
exports.ConfirmOptCode =(req, res)=>{
    const idUser = req.body;
    // get User datas
    modelOfUsers.findOne({$and:[{email: idUser.email}, {ActivationToken:idUser.Token}]})
    .then(userDatas=>{
        if(userDatas){
            res.status(200).json({msg:"Valid Code of user"});
        }
        else{
           res.status(401).json({msg:"user not Found"}); 
        }
    })
    .catch(error =>{
         console.log(`Error Database ${error}`) // if Error  Connexion to dataBase
         res.status(500).json({msg:"Erreur server"}) 
      });
}

//Updating password and image Profile
exports.Activation_account = (req, res) => {
    const idUser = req.body //get datas user
    console.log(idUser);

    // SEARCHING USER IN DATABASE
        try{
            modelOfUsers.findOne({$and:[{email: idUser.email}, {ActivationToken:idUser.Token}]})
            .then(userFund =>{
                if(userFund){
                    if(userFund.isActive){
                        res.status(403).json({msg:"Compte actif, Connectez-vous!"});
                    }
                    else{
                        // hashing PassWord
                        
                        bcrypt.hash(req.body.password, SALTE_PWD)
                        .then(passwordHash =>{
                            console.log(passwordHash)
                            modelOfUsers.updateOne({$and:[{email: idUser.email}, {ActivationToken:idUser.Token}]},{
                                $set:{
                                    passWord:passwordHash,
                                    isActive: true,
                                    cover:idUser.secureCover,
                                    ActivationToken:null
                                }
                            })
                            .then(()=>{
                                res.status(200).json({msg:"Activation du compte Reussi", Updating:true, actif:true});
                            })
        
                            .catch((error)=>{
                                console.log(error);
                                res.status(500).json({msg:"Activation echouée, Error Server"});
                            })  
                        })
                        .catch(error => {
                            console.log(`Erreur lors du hashing du password \n ${error}`)
                            res.status(500).json({msg:"Impossible d'activer le compte"});
                        });
                   }
                }
                else{
                        console.log("Aucun Compte Correspondant");
                        res.status(404).json({msg:"Echec d'activation, identifiants non trouvés"});                        
                }
            })
            .catch(error =>{
                console.log(error)
                res.status(500).json({msg:"Error Server"});
            })
        }
        catch{(error)=>{
            console.log(error);
            res.status(500).json({msg:"Error Server"});
        }}
    }

    exports.HashingPassWord = (req, res) => {
       // hashing PassWord
       bcrypt.hash("Eliasone02@", SALTE_PWD)
       .then(passwordHash =>{
        console.log(passwordHash);
        res.status(200).json({passwordHash});
           })
           
       .catch(error => {
           console.log(`Erreur lors du hashing du password \n ${error}`)
           res.status(500).json({msg:"Impossible d'activer le compte -> Error Server lors du hashing du password"});
       });
}  

//Register New User

exports.registerNewUser = (req, res) =>{
    const DatasOfForm = req.body;
    console.log(DatasOfForm);

// create Transport of nodemail
const transport = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
}) 

    const newUser = new modelOfUsers(DatasOfForm); // created news user with datas of formulaire
    newUser.save() // saving new objet in data base
    .then((datas)=> {
        res.status(200);
        res.json({message: "'success': New User created"});

            // option of sending mail
            let mailOptions ={
                from:process.env.EMAIL_USER,
                to:DatasOfForm.email,
                subject:"Creation de compte reussi, Bienvenu sur la plaforme de gestion efficace d'eau",
                text:`Cher(e) ${DatasOfForm.fname} ${DatasOfForm.lname},Bienvenue chez SMART METER.`,
            };
    
            // Send a email message to user
            transport.sendMail(mailOptions,(error, infos)=>{
                if(error){
                   return console.log(`Error : ${error}`);
                };
                console.log(`Message sending ${infos}`)
            });
        console.log(datas);
    })
    .catch(error =>{
        console.log(error);
        res.status(501);
        res.json({msg: "Echec de la creation du compte"});
    });
};

exports.uploadImage =(req, res)=>{

    // cloudinary configuration
    cloudinary.config({
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET,
    });
    try{

        cloudinary.uploader.upload(req.file.path,{
            folder:"image-smartMeter",
            transformation:{width:300, height:300, crop:'limit'}
        }).then((datas)=>{

            // delete local image
            fs.unlinkSync(req.file.path);

            // send Response to client
            res.status(201);
            res.json({Url: datas.url,secureUrl: datas.secure_url}); 
        }).catch(error=>{
            console.log(error);
                // respond
            res.status(501);
            res.json({msg: "Deployement image Error Server"}); 
        })

    }
    catch(error){
    // respond
    res.status(501);
    res.json({msg: "Deployement image Error Server"}); 
    }

}