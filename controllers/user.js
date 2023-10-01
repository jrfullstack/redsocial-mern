// importar dependencias y modulos
const bcrypt = require("bcrypt");
const fs = require("fs");

// importacion de modulos
const User = require("../models/user");

// importacion de servicios
const jwt = require("../services/jwt");



// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/users.js",
        usuario: req.user,
    })
}

// Registro de usuarios
const register = (req, res) => {
    // recoger datos de la peticion
    let params = req.body;
    console.log(params)

    // comprobar que me llegan
    // if comprobamos q los campos obligatorios llegan
    if(!params.name || !params.email || !params.password || !params.nick){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos requeridos por enviar"
        });
    }    

    // control de usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() },
        ]

    }).then(async(users) => {
        // si existe un usuario con el mismo nick o email
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        // cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // crear objeto de usuario
        let user_to_save = new User(params);

        // guardar usuario bd
        user_to_save.save().then((userStored) => {
            // si todo esta correcto, se guarda
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored,
            });
        }).catch((error) => {
            // si existe un error
            if (error || !userStored){
                return res.status(500).send({
                    status: "error",
                    message: "Error al guardar el usuario",
                });
            }
        });

        
    }).catch((error) => {
        // si llega un error
        if (error)
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta de usuarios",
            });
    });
    
}

const login = async(req, res) => {
    // Recoger los parametros
    let params = req.body;

    // validamos los parametros recogidos
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    // buscar en la base de datos si existe
    try {
        let user = await User.findOne({ email: params.email });
 
        if(!user) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario",
            });
        }
 
        //Comprobar su contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);

        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "No te has identificado correctamente",
            });
        }
 
        // conseguir el Token
        const token = jwt.createToken(user);;

        //  eliminar password del token
 
        // devolver datos de usaurio
        return res.status(200).send({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });
 
    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "hubo un error",
        });
    }  
    
}

const profile = async (req, res) => {
    // recibir el parametro de id deusuario por la url
    const id = req.params.id;
    console.log(id)

    try {
        // Obtener perfil usuario
        const userProfile = await User.findById(id).select({
            password: 0,
            role: 0,
        });

        // si el usuario no existe
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario",
            });
        }

        // devolver los datos del usuario si todo sale bien
        // devolver informacion del follow
        return res.status(200).send({
            status: "success",
            user: userProfile
        });

    } catch (error) {
        // si hubo un error
        return res.status(404).send({
            status: "error",
            message: "hubo un error en la consulta",
        });
    }
};

const list = async(req, res) => {
    //  controlar en q pagina estamos
    let page = parseInt(req.params.page) || 1;

    //  consulta con mongoose pagination
    // limitar usuarios por pagina
    let itemsPerPage = 5;

    // opciones de la paginacion
    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 },
        collation: {
            locale: "es",
        },
        
    };    

    try {
        // obtenes los usuarios
        const users = await User.paginate({}, options);

        // ontenes el numero total de usuarios
        const total = await User.countDocuments();

        // si no existe un usuario devolvermos el error
        if (!users)
            return res.status(404).json({
                status: "Error",
                message: "No se han encontrado usuarios",
            });

        // devolver el resultado si todo a salido bien
        return res.status(200).send({
            status: "success",
            users: users.docs,
            page,
            itemsPerPage,
            total,

            // redondeamos con ceil el numero de paginas con usuarios a mostrar
            pages: Math.ceil(total / itemsPerPage)
        });

    } catch (error) {
        return res.status(404).json({
            status: "Error",
            message: "Hubo un error al obtener los usuarios",
            error: error.message,
        });
    }
}

const update = (req, res) => {
    // recoger la informacion actual del usuario (antes de modificarse)
    const userIdentity = req.user;

    // recogemos la informacion nueva del usuario
    const userToUpdate = req.body

    // eliminar los campos q no se necesitan de la nueva informacion
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // comprobar si el usuario ya existe
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() },
        ],
    })
        .then(async (users) => {
            // verificamos si ya existe el usuario
            // barremos la respusta el find
            // y comparamos los id,
            // si es un usuario con un id distinte pero con el mismo email y nick
            // la variable pasa a true y en tra en el return
            // pero si es el mismo id del usuario con q estamos logeados, nos permitira continuar a su modificacion
            let userIsset = false;
            users.forEach((user) => {
                if (user && user._id != userIdentity.id) {
                    userIsset = true;
                }
            });

            if (userIsset) {
                return res.status(200).send({
                    status: "success",
                    message: "El usuario ya existe",
                });
            }
            // cifrar la contraseña
            if (userToUpdate.password) {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                // le pasamos la contrasenia al objeto nuevo
                userToUpdate.password = pwd;
            }

            // buscar y actualizar
            try {
                let userUpdated = await User.findByIdAndUpdate(
                    userIdentity.id,
                    userToUpdate,
                    { new: true }
                );

                if (!userUpdated) {
                    return res.status(400).json({
                        status: "error",
                        message: "Error al actualizar usuarios",
                    });
                }

                // devolvemos la informacion si se guardo correctamente
                return res.status(200).send({
                    status: "success",
                    message: "Usuario actualizado correctamente",
                    user: userUpdated,
                });

            }catch(error) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al actualizar usuarios"
                });
            }
        })
        .catch((error) => {
            // si llega un error
            if (error){
                return res.status(500).json({
                    status: "error",
                    message: "Error al actualizar usuarios",
                });
            }
        });
    
}

const upload = async (req, res) => {
    // recoger el fichero de imagen y comprobar que existe
    if(!req.file){
        return res.status(404).json({
            status: "error",
            message: "La peticion no incluye la imagen",
        });
    }

    // conseguir el nombre del archivo
    let image = req.file.originalname;

    // sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // validar extension
    if ((extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif")) {
        const filePath = req.file.path;

        // si no es una imagen la boramos
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extension del fichero invalido",
        });
    }
    
    // guardar archivo
    try {
        let userUpdated = await User.findByIdAndUpdate(
            req.user.id,
            { image: req.file.filename },
            { new: true }
        );

        if (!userUpdated) {
            return res.status(400).json({
                status: "error",
                message: "Error en la subida del avatar",
            });
        }

        // devolver respuesta
        return res.status(200).send({
            status: "success",
            file: req.file,
            user: userUpdated,
        });
    } catch (error) {
        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error al guardar el avatar",
            });
        }
    }

    
}

// Exportar accion
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload
};