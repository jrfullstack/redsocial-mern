const express = require("express");
const router = express.Router();
const publicationContoller = require("../controllers/publication");

// Definir las rutar
router.get("/prueba-publication", publicationContoller.pruebaPublication);

// Exportar router
module.exports = router;
