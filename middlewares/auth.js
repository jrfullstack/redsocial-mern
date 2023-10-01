// Dependencias
const jwt = require("jwt-simple");
const moment = require("moment/moment");

// clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {
    // comprobar cabezera de autenticacion
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion",
        });
    }

    // limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, "");

    // decodificar el token
    try {
        let payload = jwt.decode(token, secret);

        // comprobar expiracion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
            });
        }

        // agregar datos de usuarios a request
        req.user = payload;

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        });
    }

    

    // pasar a ejecucion de accion
    next();
}

