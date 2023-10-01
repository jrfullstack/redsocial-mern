// Dependencias
const jwt = require("jwt-simple");
const moment = require("moment/moment");

// Clave secreta
const secret = "CLAVE-SECRETA";

// Generar token
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    // Devolver token
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    
    createToken,
};