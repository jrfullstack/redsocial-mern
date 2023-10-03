const express = require("express");
const router = express.Router();
const followContoller = require("../controllers/follow");
const check = require("../middlewares/auth");


// Definir las rutar
router.get("/prueba-follow", followContoller.pruebaFollow);
router.post("/save", check.auth, followContoller.save);
router.delete("/unfollow/:id", check.auth, followContoller.unFollow);
router.get("/following/:id?/:page?", check.auth, followContoller.following);
router.get("/followers/:id?/:page?", check.auth, followContoller.followers);


// Exportar router
module.exports = router;
