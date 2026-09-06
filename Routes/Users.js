// Routers for Authentification of users
const router = require("express").Router();
const CtrlUser = require("../Controllers/users");

router.get("/:useRole/:status", CtrlUser.getAllUsers);
router.get("/locators", CtrlUser.getLocators);
router.delete("/Delete/:id", CtrlUser.deleteUser);
router.post("/logout", CtrlUser.logout);
router.post("/NewAppart",  CtrlUser.NewAppartement);
router.post("/NewPayement",  CtrlUser.Payement);
router.get("/Notifications",  CtrlUser.GetNotification);
router.get("/HistoryPayement",  CtrlUser.GetPayementsHistory);
router.delete("/Notifications",  CtrlUser.DeleteNotification);

module.exports = router;