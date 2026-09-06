const mongoose = require("mongoose");

// modelsusers 
const modelOfCounter = require("../Models/counter"); // import model of Counter
const modelOfNotification = require("../Models/Notification"); // import model of Notification


const generate_insufficientDatas_Notification=(idAdmin, idClient, idCounter, userName)=>{
    const ClientId = (new mongoose.Types.ObjectId(idClient));
    const AdminId = (new mongoose.Types.ObjectId(idAdmin));
    const newNotification_Client = new modelOfNotification({
        receiverId:ClientId,
        AdminId:idAdmin,
        userId:ClientId,
        idCounter:idCounter,
        message:`Alerte : Cher(e) ${userName}, le solde de votre Compteur est presque insuffisant.`
    }); // create new client Notification 
        
    const newNotification_Admin = new modelOfNotification({
        receiverId:AdminId,
        AdminId:idAdmin,
        userId:ClientId,
        idCounter:idCounter,
        message:`Alerte solde du compteur: ${idCounter} preseque insuffisant dans l'Appartement du client ${userName}.`
    });
    
    newNotification_Client.save().then(()=> console.log("Insufficient Notification client generated")); // creation insufficient client Notification
    newNotification_Admin.save().then(()=> console.log("Insufficient Notification Admin generated")); // creation insufficient Notification Admin
   
    // reset Payement State of Counter
    modelOfCounter.updateOne({idCounter:idCounter},{
        $set:{
            newPayement:false
        }
    }).then(()=> console.log("New Payement Reset")); // creation insufficient Notification Admin
}


exports.saveEspDatas = (req, res) =>{
    const reqDatas = req.query;
    console.log(reqDatas);// req parameters datas

    // converte values to m3
    const valueCounter_1 = reqDatas.water_01/ 1000;
    const valueCounter_2 = reqDatas.water_02 / 1000;

    modelOfCounter.find() // saving new objet in data base
        .then((Counterdatas)=> {
            if(Counterdatas.length){

                // update values datas
                if(Counterdatas.length > 1){
                    if(valueCounter_1 > 0){
                        const CounterDatas = Counterdatas[0];
                        const CounterValue = CounterDatas.TotalPayementValue - (CounterDatas.TotalCounterValue + valueCounter_1);

                        modelOfCounter.updateOne({idCounter:CounterDatas.idCounter},{
                            $set:{
                                TotalCounterValue:CounterDatas.TotalCounterValue + valueCounter_1,
                                counterValue:CounterValue,
                                isActive: CounterValue > 0.0002
                            }
                        }).then(()=>{
                            console.log("updating Counter datas 1");
                            if((CounterValue < 0.0008 ) && CounterDatas.newPayement){
                                generate_insufficientDatas_Notification(CounterDatas.AdminId, CounterDatas.userId, CounterDatas.idCounter, CounterDatas.email); // create notification
                            }
                        });
                    }
                        if(valueCounter_2 > 0){
                            const CounterDatas = Counterdatas[1];
                            const CounterValue = CounterDatas.TotalPayementValue - (CounterDatas.TotalCounterValue + valueCounter_2);
    
                            modelOfCounter.updateOne({idCounter:CounterDatas.idCounter},{
                                $set:{
                                    TotalCounterValue:CounterDatas.TotalCounterValue + valueCounter_2,
                                    counterValue:CounterValue,
                                    isActive: CounterValue > 0.0002
                                }
                            }).then(()=>{
                                console.log("updating Counter datas 2");
                                if((CounterValue < 0.0008 ) && CounterDatas.newPayement){
                                    generate_insufficientDatas_Notification(CounterDatas.AdminId, CounterDatas.userId, CounterDatas.idCounter, CounterDatas.email); // create notification
                                }
                            });
                        }
                 }
                 else{
                    if(valueCounter_1 > 0){
                        const CounterDatas = Counterdatas[0];
                        const CounterValue = CounterDatas.TotalPayementValue - (CounterDatas.TotalCounterValue + valueCounter_1);

                        modelOfCounter.updateOne({idCounter:CounterDatas.idCounter},{
                            $set:{
                                TotalCounterValue:CounterDatas.TotalCounterValue + valueCounter_1,
                                counterValue:CounterValue,
                                isActive: CounterValue > 0.0002
                            }
                        }).then(()=>{
                            console.log("updating Counter datas 1");
                            if((CounterValue < 0.0008 ) && CounterDatas.newPayement){
                                generate_insufficientDatas_Notification(CounterDatas.AdminId, CounterDatas.userId, CounterDatas.idCounter, CounterDatas.email); // create notification
                            }
                        });
                    }
                }
                const responseDatas ={
                    id:"",
                    isActive:"",
                    counterValue :""
                };

                for(i=0; i<Counterdatas.length; i++ ){
                    responseDatas.id =  i == 0 ?`${Counterdatas[i].idCounter }`: `${responseDatas.id}~${Counterdatas[i].idCounter}`;
                    responseDatas.isActive =  i == 0 ?`${Counterdatas[i].isActive ? 't':'f'}`: `${responseDatas.isActive}~${Counterdatas[i].isActive ? 't':'f'}`;
                    responseDatas.counterValue =  i == 0 ?`${Math.trunc(Counterdatas[i].counterValue *100000)/100}`: `${responseDatas.counterValue}~${Math.trunc(Counterdatas[i].counterValue * 100000)/100}`;
                }

                // send Response to Esp
                console.log(responseDatas);
                    res.status(200);
                    res.json(responseDatas);
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