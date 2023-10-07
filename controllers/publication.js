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
            error
        });
    }

    // return res.status(200).send({
    //     status: "success",
    //     message: "Pueba de eliminacion"
    // })
}

// Listar publicaciones

// Listar publicaciones de un usuario

// subir ficheros

// Devolver archivos multimedia - Imagenes

// Exportar accion
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove
};
