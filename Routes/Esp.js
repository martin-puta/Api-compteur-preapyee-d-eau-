// Routers for Authentification of users
const router = require("express").Router();
const CtrEsp = require("../Controllers/Esp");

router.get("/", CtrEsp.saveEspDatas);
router.post("/notification", CtrEsp.saveEspDatas);

module.exports = router;