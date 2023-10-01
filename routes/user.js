const express = require("express");
const router = express.Router();
const userContoller = require("../controllers/user");
const check = require("../middlewares/auth");

// Definir las rutar
router.get("/prueba-usuario", check.auth, userContoller.pruebaUser);
router.post("/register", userContoller.register);
router.post("/login", userContoller.login);
router.get("/profile/:id", check.auth, userContoller.profile);
router.get("/list/:page?", check.auth, userContoller.list);
router.put("/update", check.auth, userContoller.update);


// Exportar router
module.exports = router;