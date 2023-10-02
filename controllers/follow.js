// Importar models
const Follow = require("../models/follow");
const User = require("../models/user");



// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.js",
    });
};

// Accion de guardar un follow / seguir
const save = (req, res) => { 
    // conseguir datos por body - aqui voy a seguir
    const params = req.body;

    // sacar el usuario identificado - quien es q esta logeado
    const identity = req.user;

    // crear objeto con modelo follow
    let userToFollow = new Follow({
        // pasamos el usuario identificado
        user: identity.id,
        // userToFollow.followed = params.followed;
        followed: params.followed,
    });

    
    // guardar objeto en bd
    userToFollow.save()
                .then((followStored) => {
        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored,
        });
    }).catch((error)=> {
        return res.status(400).send({
            status: "error",
            message: "No se pudo seguir al usuario"
        });
    });
    // userToFollow.save((error, followStored) => {


    //     return res.status(200).send({
    //         status: "success",
    //         identity: req.user,
    //         follow: followStored,
    //     });
    // })


    
 }

// Accion de borrar un follow / dejar de seguir

// Accion listado de usuarios seguido

// Accion listado de usuarios que me siguen





// Exportar accion
module.exports = {
    pruebaFollow,
    save
};
