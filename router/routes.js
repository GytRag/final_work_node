const express = require('express');
const router = express.Router();


const {
    addToFavorite,
    register,
    login,
    updateUsername,
    updateImg,
    deleteFavorite,
    favorite,
    deleteUser,
    updatePassword,
    createPost,
    allPosts,
    getPost,
    addComment,
    getUserPosts,
    sendMessage,
    getMessage,
    deleteMessage,
    deleteChat,
    deletePost
} = require('../controllers/mainControllers');

const {
    validateRegister,
    validateLogin
} = require('../middleware/validators');


const userAuth = require('../middleware/userAuth');


router.get('/allPosts', allPosts)
router.get('/favorite',userAuth, favorite)

router.post('/login',validateLogin, login)
router.post('/register',validateRegister , register)

router.post('/updateusername',userAuth , updateUsername)
router.post('/updatepassword',userAuth , updatePassword)
router.post('/updateimg',userAuth , updateImg)

router.post('/createPost',userAuth, createPost)
router.get('/post/:id',userAuth, getPost)
router.post('/addcomment',userAuth, addComment)
router.get('/user/:username',userAuth, getUserPosts)
router.post('/deletepost',userAuth, deletePost)

router.post('/addfavorite',userAuth , addToFavorite)
router.post('/deletefavorite',userAuth , deleteFavorite)

router.post('/deleteuser',userAuth , deleteUser)

router.post('/sendmessage',userAuth , sendMessage)
router.get('/getmessage',userAuth , getMessage)
router.post('/deletemessage',userAuth , deleteMessage)
router.post('/deletechat',userAuth , deleteChat)

module.exports = router;