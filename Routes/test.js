const router = require("express").Router();
const ModelTest = require("../Models/Admin_Users");
const CtrlUser = require("../Controllers/Authentification")

router.get("/", (req, res)=>{
    ModelTest.findOne()
    .then((datas)=>{
        res.status(200).json(datas);
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({msg:"Error Server"})
    })
})

// router.get("/", CtrlUser.registerNewUser);

module.exports = router;