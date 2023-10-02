const express = require("express");
const router = express.Router();
const followContoller = require("../controllers/follow");
const check = require("../middlewares/auth");


// Definir las rutar
router.get("/prueba-follow", followContoller.pruebaFollow);
router.post("/save", check.auth, followContoller.save);

// Exportar router
module.exports = router;
