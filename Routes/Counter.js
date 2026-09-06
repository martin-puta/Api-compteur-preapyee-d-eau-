// Routers for Authentification of users
const router = require("express").Router();
const CtrCounter = require("../Controllers/Counter");

router.get("/", CtrCounter.getCounterdatas);
router.post("/changeState", CtrCounter.changeState);

module.exports = router;