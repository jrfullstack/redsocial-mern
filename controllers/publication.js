// Modulos
const fs = require("fs");
const path = require("path");

//  Modelos DB
const Publication = require("../models/publication");

//  Servicios
const { followUserIds } = require("../services/followServices");


// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js",
    });
};

// Guardar publicacion
const save = (req, res) => {
    // recoger datos del body
    const params = req.body;

    // validacion de los datos del body
    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "Debes rellenar el campo de texto"
        })
    }

    // crear y rellenar el objeto de modelo
    let newPublication = new Publication(params);
        // recoger la informacion del usuario identificado
    newPublication.user = req.user.id;

    // guardar objeto en la base de datos
    newPublication.save()
                  .then((publicationStored) => {

                    return res.status(200).send({
                        status: "success",
                        message: "Publicacion guardada correctamente",
                        publicationStored
                    })
                  }).catch((error) => {
                    return res.status(400).send({
                        status: "error",
                        message: "No pe pudo guardar la publicacion"
                    })
                  });
}

// Sacar una publicacion
const detail = async(req, res) => {
    // sacar el id de la publicacion
    const publicationId = req.params.id

    try {
        // buscar la publicacion q coincida con el id
        const publicationStored = await Publication.findById(publicationId);
        if (!publicationStored) {
            return res.status(400).send({
                status: "error",
                message: "No existe la publicacion",
            });
        }

        // devolver respuesta
        return res.status(200).send({
            status: "success",
            // message: "prueba correctamente",
            publication: publicationStored
        });
    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "No se pudo guardar la publicacion",
        });
    }
    

    
}

// Eliminar publicaciones
const remove = async (req, res) => {
    // sacar el ide de la publicacion
    const publicationId = req.params.id;

    // buscar y eliminar la publicacion
    try {
        // validamos la busqueda donde el usuario identificado sea dueno de la publicacion
        await Publication.deleteOne({"user": req.user.id, "_id": publicationId});

        return res.status(200).send({
            status: "success",
            message: "Se ha eliminando correctamente la publicacion",
            publication: publicationId,
            // removedPublication,
        });
    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "No se pudo eliminar la publicacion",
            // error
        });
    }

    // return res.status(200).send({
    //     status: "success",
    //     message: "Pueba de eliminacion"
    // })
}

// Listar publicaciones de un usuario
const user = async(req, res) => {
    // sacar el id de usuario
    const userId = req.params.id;

    // controlar el numero de la pagina
    let page = parseInt(req.params.page) || 1;

    let itemsPerPage = 5;

    const query = { user: userId };
    const options = {
        page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        populate: [{
            path: "user",
            select: "-password -role -__v"
        }],
        collation: {
            locale: "es",
        },
    };

    try {
        // buscar, populate, ordenar y paginar
        let publications = await Publication.paginate(query, options);

        // validamos si hay publicaciones
        if (publications.docs.length <= 0 || !publications) {
            return res.status(404).send({
                status: "error",
                message: "Noy publicaciones para mostrar",
                // error
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil del usuario",
            page,
            total: publications.totalDocs,
            pages: publications.totalPages,
            publications: publications.docs,
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se pudo buscar las publicaciones",
            // error
        });
    }
}

// subir ficheros
const upload = async (req, res) => {
    // sacar id de la publicacion
    const publicationId = req.params.id

    // recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).json({
            status: "error",
            message: "La peticion no incluye la imagen",
        });
    }

    // conseguir el nombre del archivo
    let image = req.file.originalname;

    // sacar la extension del archivo
    const imageSplit = image.split(".");
    const extension = imageSplit[1];

    // validar extension
    if (
        extension != "png" &&
        extension != "jpg" &&
        extension != "jpeg" &&
        extension != "gif"
    ) {
        const filePath = req.file.path;

        // si no es una imagen la borramos
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extension del fichero invalido",
        });
    }

    // Subir arcivos
    try {
        let publicationUpdated = await Publication.findByIdAndUpdate(
            // validamos que sea dueno de la publicacion
            // y el id de la publicacion donde se subira
            { user: req.user.id, "_id": publicationId },

            // apuntamos a donde vamos a guardar la informacion
            { file: req.file.filename },

            // y me devuelve los datos nuevos
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(400).json({
                status: "error",
                message: "Error en la subida del avatar",
            });
        }

        // devolver respuesta
        return res.status(200).send({
            status: "success",
            publication: publicationUpdated,
            file: req.file,
        });

    } catch (error) {

        
        return res.status(500).json({
            status: "error",
            message: "Error al guardar el avatar",
        });
        
    }
};

// Devolver archivos multimedia - Imagenes

const media = (req, res) => {
    // sacar el parametro de la url
    const file = req.params.file;

    // montar el path real de la imagen
    const filePath = "./uploads/publications/" + file;

    // validar
    fs.stat(filePath, (error, exists) => {

        if (!exists) {
            return res.status(400).json({
                status: "error",
                message: "No existe la imagen",
            });
        }

        // devolver el file
        return res.sendFile(path.resolve(filePath));
    });
};

// Listar publicaciones de los usuarios a los q seguimos

const feed = async(req, res) => {
    // Pagina actual
    let page = parseInt(req.params.page) || 1;

    // consulta con mongoose pagination
    // limitar usuarios por pagina
    let itemsPerPage = 5;

    // const query = { user: following };
    const options = {
        page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        populate: [
            {
                path: "user",
                select: "-password -role -__v -email",
            },
        ],
        collation: {
            locale: "es",
        },
    };

    // Sacar array de id de usuarios q seguimos
    try {
        // array
        const { following } = await followUserIds(req.user.id);

        // Buscar las publicaciones, ordenar, popular y paginar
        const publications = await Publication.paginate({user: following}, options);

        // validamos
        if (!publications) {
            return res.status(500).json({
                status: "error",
                message: "No hay publicaciones para mostrar",
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            following,
            page,
            total: publications.totalDocs,
            pages: publications.totalPages,
            publications: publications.docs,
        });
    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "No se ha podido listar las publicaciones del feed.",
        });
    }


    
}

// Exportar accion
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
};
