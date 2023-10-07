const express = require("express");
const router = express.Router();
const multer = require("multer");
const userContoller = require("../controllers/user");
const check = require("../middlewares/auth");

// configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+Date.now()+"-"+file.originalname)
    },
});

const uploads = multer({storage});

// Definir las rutar
router.get("/prueba-usuario", check.auth, userContoller.pruebaUser);
router.post("/register", userContoller.register);
router.post("/login", userContoller.login);
router.get("/profile/:id", check.auth, userContoller.profile);
router.get("/list/:page?", check.auth, userContoller.list);
router.put("/update", check.auth, userContoller.update);
router.post("/upload", [check.auth, uploads.single("file0")], userContoller.upload);
router.get("/avatar/:file", userContoller.avatar);
router.get("/counters/:id", check.auth, userContoller.counters);


// Exportar router
module.exports = router;