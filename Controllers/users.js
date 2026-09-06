// nodemailer importing
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

// modelsusers 
const modelOfUsers = require("../Models/Users"); // import model of Users
const modelOfCounter = require("../Models/counter"); // import model of Counter
const modelOfNotification = require("../Models/Notification"); // import model of Notification
const modelOfHistory = require("../Models/HistoryPayement"); // import model of History

// controller Check Auth user
exports.deleteUser =(req, res)=>{
        //search user in dataBase
        console.log(req.params);
        modelOfUsers.findOne({_id:req.params.id})
        .then(userDatas=>{
            if(userDatas){
                console.log(userDatas)
                // search a type of Account
                switch(userDatas.useRole){
                    case "ADMIN_PARC":{
                        console.log("it is Admin");
                            modelOfUsers.deleteOne({_id:req.params.id})
                            .then(() =>{
                    
                                // delete datas
                                // 1. delete All notifications
                                modelOfNotification.deleteMany({AdminId:req.params.id}).then(()=>console.log("notifications of user Admin deleted"))

                                // 2. delete All Locators
                                modelOfUsers.deleteMany({adminID:req.params.id}).then(()=>console.log("Locators of user Admin deleted"))

                                // 3. delete All Counters of Locators
                                modelOfCounter.deleteMany({AdminId:req.params.id}).then(()=>console.log("Counter of user Admin deleted"))
                                .then(()=>{
                                    console.log("user and all datas of user deleted");
                                    res.status(200).json("user Deleted");
                                })
                                
                            })
                            .catch(error =>{
                                console.log(error);
                                res.status(500).json({error});
                            })   
                        break;
                    };
                    case "LOCATOR":{
                        console.log("it is Locator");
                        modelOfUsers.deleteOne({_id:req.params.id})
                        .then(() =>{
                            // delete counter datas
                            modelOfNotification.deleteMany({receiverId:req.params.id}).then(()=>console.log("notifications of user deleted"))
                            modelOfCounter.deleteOne({userId:req.params.id})
                            .then(()=>{
                                console.log("Locator deleted");
                                res.status(200).json("Locator Deleted");
                            })
                            
                        })
                        .catch(error =>{
                            console.log(error);
                            res.status(500).json({error});
                        }) 
                        break;
                    };
                    case "DEALER":{
                        console.log("it is Dealer");
                        modelOfUsers.deleteOne({_id:req.params.id})
                        .then(() =>{
                
                            // delete counter datas
                            modelOfHistory.deleteMany({DealerId:req.params.id})
                            .then(()=>{
                                console.log("Dealer user and History deleted");
                                res.status(200).json("Dealer Deleted");
                            })
                            
                        })
                        .catch(error =>{
                            console.log(error);
                            res.status(500).json({error});
                        }) 
                        break;
                    };
                }             
            }
            else{
                res.status(404).json({msg:"utilisateur inconu"});
            }
           
        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({msg:"Erreur lors de la suppression"});
        }) 

};

// controller Check Auth user
exports.logout =(req, res)=>{
    //search user in dataBase
    console.log(req.body);
    modelOfUsers.updateOne({_id:req.body.id},{
        $set:{
            socketID:null
        }
    })
    .then(()=>{
        console.log("user Logout")
        res.status(200).json({msg:"User Logout"});
    })

    .catch((error)=>{
        console.log(error);
        res.status(500).json({msg:"Deconnexion echouée, Error Server"});
    })
};

exports.getAllUsers =(req, res)=>{

    //Querry datas
    const parameters = req.params;
    const query = req.query;

    //type of Filter datas
    const status ={
        ALL:"ALL",
        ACTIVE:"ACTIVE",
        DESACTIVE:"DESACTIVE",
    }
    
    //filter datas
    const filter ={
        useRole:parameters.useRole
    }

    // check status filter
    switch(parameters.status){
        case status.ACTIVE:{
            filter.isActive = true;
            break;
        };
        case status.DESACTIVE:{
            filter.isActive = false;
            break;
        };
        default:{
            console.log("Return all datas");
        }
    }
    console.log(parameters);
    console.log(query);

        //if Keyword content value
        if(query.keyword){
                modelOfUsers.find(
                    {$text: {$search: query.keyword, $language: "fr" }}, 
                    {score: {$meta: "textScore"}}).sort({score:{$meta:"textScore"}})
                .then(userFund =>{
                        res.status(200).json({msg:"Tout les utilisateurs du reseau", AllUsers:userFund});
                    
                })
                .catch(error =>{
                    console.log(error);
                    res.status(500).json({error});
                }) 
            }

        else{
        //search AllStudents in dataBase
        modelOfUsers.find(filter)
        .then(userFund =>{
                res.status(200).json({msg:"Tout les utilisateurs du reseau", AllUsers:userFund});
            
        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({error});
        }) 
        }
          
};


exports.getLocators =(req, res)=>{
    //Querry datas
    const query = req.query;
    console.log(query);

    //type of Filter datas
    const status ={
        ALL:"ALL",
        ACTIVE:"ACTIVE",
        DESACTIVE:"DESACTIVE",
    }
    
    //filter datas
    const filter ={
        useRole:query.useRole,
    }

    // check if idminId is defined
    if(query.userId){
        filter._id = query.userId
    }
    
    // check if idminId is defined
    if(query.adminId){
        filter.adminID = query.adminId
    }
    // check status filter
    switch(query.status){
        case status.ACTIVE:{
            filter.isActive = true;
            break;
        };
        case status.DESACTIVE:{
            filter.isActive = false;
            break;
        };
        default:{
            console.log("Return all datas");
        }
    }
        modelOfUsers.find(filter)
        .then(userFund =>{
                res.status(200).json({msg:"Tout les utilisateurs du reseau", AllUsers:userFund});
            
        })
        .catch(error =>{
            console.log(error);
            res.status(500).json({error});
        })
          
};

exports.NewAppartement = (req, res) =>{
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
        .then((Userdatas)=> {
            console.log(Userdatas);
            const newCounter = new modelOfCounter({
                email:DatasOfForm.email,
                userId:Userdatas._id,
                idCounter:DatasOfForm.idCounter,
                AdminId:Userdatas.adminID
            }); // created news user with datas of formulaire
                
            newCounter.save()
            .then((datas)=>{
                    console.log(datas);
                    res.status(200);
                    res.json({message: "'success': New User created"});
                    // option of sending mail
                    let mailOptions ={
                        from:process.env.EMAIL_USER,
                        to:DatasOfForm.email,
                        subject:"Création de compte reussi, Bienvenu sur la plaforme de gestion efficace d'eau",
                        text:`Cher(e) ${DatasOfForm.fname} ${DatasOfForm.lname},la configuration de votre conpteur a été effectuée avec succes chez SMART METER.`,
                    };

                        // Send a email message to user
                    transport.sendMail(mailOptions,(error, infos)=>{
                            if(error){
                            return console.log(`Error : ${error}`);
                            };
                    console.log(`Message sending ${infos}`)
                });
            })
            .catch(error =>{
                console.log(error);
                modelOfUsers.deleteOne({_id:Userdatas._id})
                .then(user => {
                    console.log(user);
                })
                .catch(error=> console.log(error));

                res.status(501);
                res.json({msg: "Echec de la creation: id du compteur existant"});
            });  
    })
    .catch(error =>{
        console.log(error);
        res.status(501);
        res.json({msg: "Echec de la creation: email ou tel existant"});
    });
};

exports.Payement = (req, res) =>{
    const DatasOfForm = req.body;
    console.log(DatasOfForm);

    modelOfCounter.findOne({idCounter:DatasOfForm.idCounter}) // saving new objet in data base
        .then((Counterdatas)=> {
            if(Counterdatas){
                modelOfCounter.updateOne({idCounter:DatasOfForm.idCounter},{
                    $set:{
                        TotalPayementValue:Counterdatas.TotalPayementValue + DatasOfForm.valuePayed,
                        counterValue:Counterdatas.counterValue + DatasOfForm.valuePayed,
                        newPayement:true,
                        isActive: true,
                    }
                })
                .then(()=>{
                    console.log(Counterdatas);
                    modelOfUsers.findOne({_id:Counterdatas.userId})
                    .then(userDatas=>{
                        console.log(userDatas);
                        const ClientId = (new mongoose.Types.ObjectId(Counterdatas.userId));
                        const AdminId = (new mongoose.Types.ObjectId(userDatas.adminID));
                        const DealerId = (new mongoose.Types.ObjectId(DatasOfForm.idDealer));
                        const newNotification_Client = new modelOfNotification({
                            receiverId:ClientId,
                            AdminId:userDatas.adminID,
                            userId:DealerId,
                            idCounter:DatasOfForm.idCounter,
                            message:`Cher(e) ${userDatas.fname} ${userDatas.lname}, Une nouvelle recharge de ${DatasOfForm.valuePayed} m3 vient d'etre effectuer sur votre compteur.`
                        }); // create new client Notification 
                            
                        const newNotification_Admin = new modelOfNotification({
                            receiverId:AdminId,
                            AdminId:userDatas.adminID,
                            userId:DealerId,
                            idCounter:DatasOfForm.idCounter,
                            message:`Le client ${userDatas.fname} ${userDatas.lname} vient d'effectuer une nouvelle recharge de ${DatasOfForm.valuePayed} m3.`
                        });
                        
                        // Create a History datas
                        const newHistory = new modelOfHistory({
                            valuePayed:DatasOfForm.valuePayed,
                            clientId:ClientId,
                            AdminId:AdminId,
                            DealerId:DatasOfForm.idDealer,
                            idCounter:DatasOfForm.idCounter,
                        }); // created news user with datas of formulaire
    
                        newNotification_Client.save(); // creation client Notification
                        newNotification_Admin.save(); // creation Notification Admin
                        newHistory.save().catch(error => console.log(error)); // creation Historique
                        res.status(200);
                        res.json({message: "'success': payement success"});

                    })
                    .catch(error =>{
                        console.log(error);
                    })
                })
            
                .catch((error)=>{
                    console.log(error);
                    res.status(500).json({msg:"Echec lors du payement"});
                })
            }

            else{
                console.log("identifiant introuvables");
                res.status(404);
                res.json({msg: "Echec: identifiants non trouvés"});
            }
            
    })
    .catch(error =>{
        console.log(error);
        res.status(501);
        res.json({msg: "Echec payement non effectuer"});
    });
};


exports.GetNotification = (req, res) =>{
    const datasQuerys = req.query;
    console.log(datasQuerys);
    const receiveUserId = new mongoose.Types.ObjectId(datasQuerys.userId);

    modelOfNotification.aggregate([{$match:{receiverId:receiveUserId}},{$lookup:{
        from:"users",
        localField:"userId",
        foreignField:"_id",
        as:"Dealer"
    }}
    ,{
        $sort:{createAt:-1}
    }]) // saving new objet in data base
        .then((AllNotifications)=> {
            console.log(AllNotifications)
                    res.status(200);
                    res.json({AllNotifications});
    })
    .catch(error =>{
        console.log(error);
        res.status(501);
        res.json({msg: "Echec Chargement"});
    });
};

exports.GetPayementsHistory = (req, res) =>{
    const datasQuerys = req.query;
    console.log(datasQuerys);
//{DealerId:datasQuerys.userId},
    modelOfHistory.aggregate([{$match:{DealerId:datasQuerys.userId}},{$lookup:{
        from:"users",
        localField:"clientId",
        foreignField:"_id",
        as:"client"
    }}, {$lookup:{
        from:"users",
        localField:"AdminId",
        foreignField:"_id",
        as:"Admin"
    }},{
        $sort:{createAt: -1}
    }]) // saving new objet in data base
        .then((History)=> {
            console.log(History)
                    res.status(200);
                    res.json({Histories:History});
    })
    .catch(error =>{
        console.log(error);
        res.status(501);
        res.json({msg: "Echec Chargement"});
    });
};

exports.DeleteNotification = (req, res) =>{
    const datasQuerys = req.body;
    console.log(datasQuerys);

    modelOfNotification.deleteOne({_id:datasQuerys.id}) // saving new objet in data base
        .then((AllNotifications)=> {
            console.log(AllNotifications)
                    res.status(200);
                    res.json({AllNotifications});
    })
    .catch(error =>{
        console.log(error);
        res.status(501);
        res.json({msg: "Echec Suppression"});
    });
};