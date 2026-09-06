// router Authorissation Authentic users
const CtrlAuthUser = require("../../Controllers/Authentification/Auth");
const router = require("express").Router();

router.post("/", CtrlAuthUser.CheckAuthUser);

module.exports = router;