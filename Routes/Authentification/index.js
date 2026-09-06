// Routers for Authentification of users
const router = require("express").Router();
const CtrlUser = require("../../Controllers/Authentification")

router.post("/AdminLogin", CtrlUser.Adminlogin);
router.post("/Login", CtrlUser.login);
router.post("/ActiveAccount", CtrlUser.Activation_account);
router.post("/CreateUser", CtrlUser.registerNewUser);

module.exports = router;