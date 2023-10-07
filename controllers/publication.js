const publication = require("../models/publication");


// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js",
    });
};

// Guardar publicacion

// Sacar una publicacion

// Eliminar publicaciones

// Listar publicaciones

// Listar publicaciones de un usuario

// subir ficheros

// Devolver archivos multimedia - Imagenes

// Exportar accion
module.exports = {
    pruebaPublication,
};
