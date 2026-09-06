
// modelsusers 
const modelOfCounter = require("../Models/counter"); // import model of Counter

exports.getCounterdatas = (req, res) =>{
    const CounterDatas = req.query;
    modelOfCounter.findOne({userId:CounterDatas.userId}) // saving new objet in data base
        .then((datas)=> {
            if(datas){
                res.status(200);
                res.json(datas);
        }

            else{
                console.log("Aucun Compteur");
                res.status(404);
                res.json({msg: "Error"});
            }
            
    })
    .catch(error =>{
        console.log(error);
        console.log("Aucun Compteur");
        res.status(500);
        res.json({msg: "Error"});
    });
};

exports.changeState = (req, res) =>{
    const CounterDatas = req.body;
    modelOfCounter.findOne({userId:CounterDatas.idUser}) // saving new objet in data base
        .then((datas)=> {
            if(datas){
                modelOfCounter.updateOne({userId:CounterDatas.idUser},{
                    $set:{
                        isActive:CounterDatas.isActive,
                    }
                }).then(()=>{
                     res.status(200);
                    res.json({msg: `Counter datas updated status: ${CounterDatas.isActive? "ACTIVE":"DESACTIVE"}`});
                })
                .catch(()=>{
                    console.log("Echec mis a jour");
                    res.status(404);
                    res.json({msg: "Echec mis a jour"});
                })
                   
            }
       
            else{
                console.log("Aucun Compteur");
                res.status(404);
                res.json({msg: "Error"});
            }
            
    })
    .catch(error =>{
        console.log(error);
        console.log("Aucun Compteur");
        res.status(500);
        res.json({msg: "Error"});
    });
};

