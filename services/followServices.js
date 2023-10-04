const Follow = require("../models/follow")

// Usuarios q me siguen
const followUserIds = async(identityUserId) => {
    // barremos la base de follow donde este usuario alla seguido a alguien
    // quietamos algunos parametros q no necesitemos
    try {
        // sacar informacion de seguimiento
        let following = await Follow.find({"user": identityUserId})
                                    .select({"_id": 0, "followed": 1})
                                    // .then((follows) => follows)
        let followers = await Follow.find({"followed": identityUserId})
                                    .select({"_id": 0, "user": 1});

        // procesar array de identificadores
        followingClean = [];
        following.forEach(follow => {
            followingClean.push(follow.followed);
        });

        followersClean = [];
        followers.forEach((follow) => {
            followersClean.push(follow.user);
        });

    return {
        following: followingClean,
        followers: followersClean,
    };
    } catch (error) {
        return {};
    }
    
}

// sigo a este usuario?
const followThisUser = async (identityUserId, profileUserId) => {
    // sacar informacion de seguimiento
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId });
    
    let follower = await Follow.findOne({ "user": profileUserId, "followed": identityUserId });


    return {
        following,
        follower
    }
};


module.exports = {
    followUserIds,
    followThisUser
};