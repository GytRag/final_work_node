const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const createSchema = require("../schemas/createSchema");
const messageSchema = require("../schemas/messageSchema");
const io = require('../modules/sockets')
const usersOnline = require('../modules/usersOnline')

module.exports = {

    register: async (req, res) => {

        const {username, passOne} = req.body

        const userExist = await userSchema.findOne({username})
        if (userExist) return res.send({message: 'user exist', success: false})

        const salt = await bcrypt.genSalt(5);
        const hash = await bcrypt.hash(passOne, salt)

        const user = {
            username,
            password: hash
        }

        const newUser = new userSchema(user);
        await newUser.save()

        res.send({message: 'register ok', success: true});


    },
    login: async (req, res) => {

        const {username, password} = req.body

        const userExist = await userSchema.findOne({username})
        if (!userExist) return res.send({message: 'bad credentials', success: false})

        const result = await bcrypt.compare(password, userExist.password)
        if (!result) return res.send({message: 'bad credentials', success: false})

        let myUser = {
            username: userExist.username,
            image: userExist.image,
            _id: userExist._id,
            subscribers: userExist.subscribers,
            favorites: userExist.favorites
        }
        delete myUser.password

        const token = jwt.sign(myUser, process.env.SECRET_KEY)

        return res.send({message: 'login successful', success: true, token, myUser})
    },

    updateUsername: async (req, res) => {

        const {username, user} = req.body

        const userExist = await userSchema.findOne({username});
        if (userExist) return res.send({message: 'user exist', success: false})

        await createSchema.updateMany(
            {user_id: user._id},
            {$set: {name: username}})

        await messageSchema.updateMany(
            {userOne_id: user._id},
            {$set: {userOne: username}})

        await messageSchema.updateMany(
            {userTwo_id: user._id},
            {$set: {userTwo: username}})

        await userSchema.updateMany(
            {"favorites._id": {$exists: true}},
            {$set: {"favorites.$[elem].name": username}},
            {arrayFilters: [{"elem.user_id": user._id}]}
        );

        const updatedUser = await userSchema.findOneAndUpdate(
            {_id: user._id},
            {$set: {username: username}},
            {new: true, projection: {password: 0}})


        return res.send({message: 'username updated', success: true, user: updatedUser})

    },
    updatePassword: async (req, res) => {

        const {passOne, passTwo, user} = req.body

        if (passOne !== passTwo) return res.send({message: 'passwords do not match', success: false})

        const salt = await bcrypt.genSalt(5);
        const hash = await bcrypt.hash(passOne, salt)

        await userSchema.findOneAndUpdate(
            {_id: user._id},
            {$set: {password: hash}})


        return res.send({message: 'password updated', success: true})

    },
    updateImg: async (req, res) => {
        const {image, user} = req.body

        await messageSchema.updateMany(
            {userOne_id: user._id},
            {$set: {userOne_image: image}})

        await messageSchema.updateMany(
            {userTwo_id: user._id},
            {$set: {userTwo_image: image}})

        const updatedUser = await userSchema.findOneAndUpdate(
            {_id: user._id},
            {$set: {image}},
            {new: true, projection: {password: 0}})

        return res.send({message: 'image updated', success: true, user: updatedUser})

    },
    deleteUser: async (req, res) => {
        const {user, password} = req.body

        const userExist = await userSchema.findOne({username: user.username})
        if (!userExist) return res.send({message: 'bad credentials', success: false})

        const result = await bcrypt.compare(password, userExist.password)
        if (!result) return res.send({message: 'bad credentials', success: false})


        await createSchema.deleteMany({user_id: user._id});
        await userSchema.updateMany(
            {"favorites.user_id": user._id},
            {$pull: {favorites: {user_id: user._id}}}
        );
        await messageSchema.deleteMany({
            $or: [{userOne_id: user._id}, {userTwo_id: user._id}]
        });
        await userSchema.findOneAndDelete({_id: user._id})

        return res.send({message: 'All notifications', success: true})

    },

    createPost: async (req, res) => {

        const {image, title, description, user} = req.body;

        if (!image || !title || !description) return console.log('adasda')

        const post = {
            image,
            title,
            description,
            name: user.username,
            user_id: user._id,
            timestamp: new Date()
        }


        const newPost = new createSchema(post);
        await newPost.save()
        return res.send({message: 'post created', success: true})

    },
    getPost: async (req, res) => {

        const {id} = req.params

        const currentPost = await createSchema.findOne({_id: id})

        return res.send({message: 'ok', success: true, currentPost})

    },
    addComment: async (req, res) => {

        const {user, comment, post_id} = req.body

        if (!comment) return console.log('no comment')

        const newComment = {
            comment,
            username: user.username,
        }

        const currentPost = await createSchema.findOne({_id: post_id})

        const allComments = currentPost.comments
        allComments.push(newComment)

        await createSchema.findOneAndUpdate(
            {_id: post_id},
            {$set: {comments: allComments}},
        )
        return res.send({message: 'ok', success: true})

    },
    getUserPosts: async (req, res) => {

        const {username} = req.params
        const userPosts = await createSchema.find({name: username})
        const userData = await userSchema.findOne(
            {username},
            {password: 0})

        return res.send({message: 'ok', success: true, userPosts, userData})

    },
    allPosts: async (req, res) => {

        const posts = await createSchema.find()

        if (!posts) return res.send({message: 'error', success: false})
        return res.send({message: 'All posts', success: true, posts})

    },
    deletePost: async (req, res) => {

        const {user, post} = req.body

        if (user._id !== post.user_id) return

        await createSchema.findOneAndDelete({_id: post._id})
        await userSchema.updateMany(
            {"favorites._id": post._id},
            {$pull: {favorites: {_id: post._id}}}
        );
        return res.send({message: 'ok', success: true})

    },

    addToFavorite: async (req, res) => {
        const {post, user} = req.body

        const myUser = await userSchema.findOne({_id: user._id})
        if (!myUser) return

        const favoritePosts = myUser.favorites

        const postInFavorites = myUser.favorites.find(fin => fin._id === post._id)

        if (postInFavorites) return
        favoritePosts.push(post)

        await userSchema.findOneAndUpdate(
            {_id: user._id},
            {$set: {favorites: favoritePosts}},
            {new: true, projection: {password: 0}})

        return res.send({message: 'add to favorite', success: true, favoritePosts})
    },
    deleteFavorite: async (req, res) => {
        const {user, post} = req.body

        const myUser = await userSchema.findOne({_id: user._id})
        if (!myUser) return res.send({message: 'error', success: false})

        const favoritePosts = myUser.favorites.filter(filt => filt._id !== post._id)
        await userSchema.findOneAndUpdate(
            {_id: user._id},
            {$set: {favorites: favoritePosts}},
            {new: true, projection: {password: 0}})

        return res.send({message: 'delete favorite', success: true, favoritePosts})

    },
    favorite: async (req, res) => {

        const {user} = req.body

        const myUser = await userSchema.findOne({_id: user._id})
        if (!myUser) return res.send({message: 'error', success: false})

        const favorites = myUser.favorites

        return res.send({message: 'All favorites', success: true, favorites})

    },

    sendMessage: async (req, res) => {

        const {message, messTo, user} = req.body

        if (messTo._id === user._id) return
        if (!message) return

        const newMessage = {
            message,
            sender: user._id,
            timestamp: Date.now()
        }

        const existChat = await messageSchema.findOne(
            {$or: [{userOne_id: user._id, userTwo_id: messTo._id}, {userTwo_id: user._id, userOne_id: messTo._id}]})


        if (!existChat) {
            const myUser = await userSchema.findOne({_id: user._id})

            const sendMessage = {
                userOne: myUser.username,
                userOne_id: myUser._id,
                userOne_image: myUser.image,
                userTwo: messTo.username,
                userTwo_id: messTo._id,
                userTwo_image: messTo.image,
                messages: []
            }

            sendMessage.messages.push(newMessage)

            const newChat = new messageSchema(sendMessage);
            await newChat.save()

            const sendChat = await messageSchema.find(
                {$or: [{userOne_id: messTo._id}, {userTwo_id: messTo._id}]})

            const userOnline = usersOnline.getUser(messTo._id)
            const mySocket = usersOnline.getUser(user._id)

            if (userOnline) io.to(userOnline.socket_id).emit("getChat", sendChat)

            return res.send({message: 'message sent', success: true})
        }

        if (existChat) {
            const chat = existChat.messages
            chat.push(newMessage)

            const find = await messageSchema.findOneAndUpdate(
                {$or: [{userOne_id: user._id, userTwo_id: messTo._id}, {userTwo_id: user._id, userOne_id: messTo._id}]},
                {$set: {messages: chat}},
                {new: true}
            )

            const userOnline = usersOnline.getUser(messTo._id)
            const mySocket = usersOnline.getUser(user._id)

            if (userOnline) io.to(userOnline.socket_id).emit("gotMessage", find)
            io.to(mySocket.socket_id).emit("sendMessage", find)

            return res.send({message: 'message sent', success: true})
        }


    },
    getMessage: async (req, res) => {

        const {user} = req.body

        const existChat = await messageSchema.find(
            {$or: [{userOne_id: user._id}, {userTwo_id: user._id}]})

        return res.send({message: 'message sent', success: true, existChat})

    },
    deleteMessage: async (req, res) => {

        const {user, chat_id, chatToSend} = req.body

        const updateChat = await messageSchema.findOneAndUpdate({_id: chat_id},
            {$set: {messages: chatToSend}},
            {new: true})
        let getter_id = null
        if (updateChat.userOne_id === user._id) getter_id = updateChat.userTwo_id
        if (updateChat.userOne_id !== user._id) getter_id = updateChat.userOne_id

        const userOnline = usersOnline.getUser(getter_id)
        const mySocket = usersOnline.getUser(user._id)
        if (userOnline) io.to(userOnline.socket_id).emit("gotMessage", updateChat)
        io.to(mySocket.socket_id).emit("sendMessage", updateChat)

        return res.send({message: 'message deleted', success: true})

    },
    deleteChat: async (req, res) => {

        const {chat, user} = req.body
        await messageSchema.findOneAndDelete({_id: chat._id})

        let getter_id = null
        if (chat.userOne_id === user._id) getter_id = chat.userTwo_id
        if (chat.userOne_id !== user._id) getter_id = chat.userOne_id

        const getterChat = await messageSchema.find(
            {$or: [{userOne_id: getter_id}, {userTwo_id: getter_id}]})
        const myChat = await messageSchema.find(
            {$or: [{userOne_id: user._id}, {userTwo_id: user._id}]})

        const userOnline = usersOnline.getUser(getter_id)
        const mySocket = usersOnline.getUser(user._id)
        if (userOnline) io.to(userOnline.socket_id).emit("getDeletedChat", getterChat)
        io.to(mySocket.socket_id).emit("getDeletedChat", myChat)

        return res.send({message: 'chat deleted', success: true})

    },
}