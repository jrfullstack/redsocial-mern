const express = require("express");
const router = express.Router();
const multer = require("multer");
const publicationContoller = require("../controllers/publication");
const check = require("../middlewares/auth");

// configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications")
    },
    filename: (req, file, cb) => {
        cb(null, "pub-"+Date.now()+"-"+file.originalname)
    },
});

const uploads = multer({storage});


// Definir las rutar
router.get("/prueba-publication", publicationContoller.pruebaPublication);
router.post("/save", check.auth, publicationContoller.save);
router.get("/detail/:id", check.auth, publicationContoller.detail);
router.delete("/remove/:id", check.auth, publicationContoller.remove);
router.get("/user/:id/:page?", check.auth, publicationContoller.user);
router.post("/upload/:id", [check.auth, uploads.single("file0")], publicationContoller.upload);






// Exportar router
module.exports = router;
