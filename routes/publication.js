const express = require("express");
const router = express.Router();
const publicationContoller = require("../controllers/publication");
const check = require("../middlewares/auth");


// Definir las rutar
router.get("/prueba-publication", publicationContoller.pruebaPublication);
router.post("/save", check.auth, publicationContoller.save);

// Exportar router
module.exports = router;
