const express = require("express");
const router = express.Router();
const followContoller = require("../controllers/follow");

// Definir las rutar
router.get("/prueba-follow", followContoller.pruebaFollow);

// Exportar router
module.exports = router;
