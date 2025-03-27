const validator = require('node-email-validation')



module.exports = {

    validateRegister: (req, res, next) => {

        const {username, passOne, passTwo} = req.body

        if (username.length < 4 || username.length > 20) return res.send({
            message: 'username length must be between 4 and 20 characters',
            success: false
        })

        // if (!validator.is_email_valid(email)) return res.send({message: 'wrong email address', success: false});

        if (passOne.length < 4 || passOne.length > 20) return res.send({
            message: 'password length must be between 4 and 20 characters',
            success: false
        })
        if (passOne !== passTwo) return res.send({message: 'passwords do not match', success: false});


        next()
    },

    validateLogin: (req, res, next) => {
        const {username, password} = req.body


        if (username.length < 4 || username.length > 20) return res.send({
            message: 'bad credentials',
            success: false
        })
        if (password.length < 4 || password.length > 20) return res.send({
            message: 'bad credentials',
            success: false
        })

        next()
    },


    validatePost: (req, res, next) => {
        const {title, image, description} = req.body

        if(title.length < 1 && description.length < 1 && image.length < 1) return res.send({
            message: 'all input data must be filled in',
            success: false})

        next()
    }

}