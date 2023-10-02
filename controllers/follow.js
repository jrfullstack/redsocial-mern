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
const save = async(req, res) => { 
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
    await userToFollow.save()
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
    
 }

// Accion de borrar un follow / dejar de seguir
const unFollow = async (req, res) => {
    // recoger el id del usuario identificado
    const userId = req.user.id;

    // recoger el id del usuario a dejar de seguir
    const followedId = req.params.id;

    // buscar en la base de datos la coincidencia y eliminarla
    await Follow.deleteOne({
        "user": userId,
        "followed": followedId

    }).then(()=> {

        return res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente",
        });

    }).catch(() => {
        return res.status(500).send({
            status: "error",
            message: "No se pudo dejar de seguir al usuario",
        });
    })
    
}

// Accion listado de usuarios seguido por un usuario
const list = (req, res) => {
    
}

// Accion listado de usuarios que me siguen





// Exportar accion
module.exports = {
    pruebaFollow,
    save,
    unFollow
};
