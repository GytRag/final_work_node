const jwt = require("jsonwebtoken");


module.exports = (req, res, next) => {

    const userToken = req.headers.authorization

    jwt.verify(userToken, process.env.SECRET_KEY,  (err, item) => {

        if(err) return res.send({message: "authentication error", success: false})
        if(!item) return res.send({message: "no authentication item", success: false})

        req.body.user = item

        next()

    })



}