// Routes for Authentification of users
const router = require("express").Router();
const CtrlAdminUser = require("../Controllers/AdminUser");

router.post("/auth/Login", CtrlAdminUser.AdminLogin);
router.post("/New", CtrlAdminUser.NewUser);
router.delete("/Delete/:id", CtrlAdminUser.deleteUser);

module.exports = router;