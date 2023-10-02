const { Schema, model } = require("mongoose");

const FollowSchema = Schema({
    // el usuario que si a...(el usuario q va a seguir a alguien)
    user: {
        type: Schema.ObjectId,
        ref: "User",
    },

    // el usuario seguido (al usuario q se siguio)
    followed: {
        type: Schema.ObjectId,
        ref: "User",
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

// exportamos el esquema
// Como se llama la identidad
// El nombre del esquema
// como se llamara en la coleccion de mongo
module.exports = model("Follow", FollowSchema, "follows");