const Publication = require("../models/publication");


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
                  })


    // devolver respuesta
    // return res.status(200).send({
    //     status: "success",
    //     message: "Guardar publicacion"
    // })
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


// Listar publicaciones


// subir ficheros

// Devolver archivos multimedia - Imagenes

// Exportar accion
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user
};
