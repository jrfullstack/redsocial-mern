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

// Accion listado de usuarios que estoy siguiendo (A los qu sigo)
const following = async (req, res) => {
    // recoger el id del usuario identificado
    const userId = req.params.id || req.user.id;
    // comprobar si me llega el id por parametro
    // if(req.params.id) userId = req.params.id;

    // comprobar si me llega la pagina por parametro, si no me llega sera la 1
    let page = parseInt(req.params.page) || 1;

    // cuantos usuarios por pagina quiero mostrar
    const itemsPerPage = 5;

    // buscar los follow en la base de datos, popular los datos y paginar
    //Metodo #1 - Error populate ist not a function
    // Follow.find({ user: userId })
    //     .populate("user followed", "-password -role -__v")        
    //     .paginate(page, itemsPerPage, (error, follows, total) => {
    //         return res.status(200).send({
    //             status: "success",
    //             message: "Listado que seguio",
    //             userId,
    //             follows,
    //             followPerPage,
    //             total,
    //             pages: Math.ceil(total / itemsPerPage),
    //         });
    //     });

    // Metodo #2
    // opciones de la paginacion
    const query = { user: userId };
    const options = {
        select: "name password",
        page: page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        // populate: "user followed",
        populate: [{
            path: "user followed",
            select: "-password -role -__v"
        }],
        collation: {
            locale: "es",
        },
    };
    
    const follows = await Follow.paginate(query, options);
    // obtenes el numero total de follows
    // console.log(follows.totalDocs);

    return res.status(200).send({
        status: "success",
        message: "Listado que seguio",
        userId,
        follows: follows.docs,
        total: follows.totalDocs,
        pages: follows.totalPages,
    });
    
}

// Accion listado de usuarios que siguen a culquier usuario (mis seguidores)
const followers = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Listado de usuarios q me siguen",
    });
};




// Exportar accion
module.exports = {
    pruebaFollow,
    save,
    unFollow,
    following,
    followers,
};
