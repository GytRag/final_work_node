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

const main = '/crud'
const userAuth = require('../middleware/userAuth');


router.get(main + '/allPosts',userAuth, allPosts)
router.get(main + '/favorite',userAuth, favorite)

router.post(main + '/login',validateLogin, login)
router.post(main + '/register',validateRegister , register)

router.post(main + '/updateusername',userAuth , updateUsername)
router.post(main + '/updatepassword',userAuth , updatePassword)
router.post(main + '/updateimg',userAuth , updateImg)

router.post(main + '/createPost',userAuth, createPost)
router.get(main + '/post/:id',userAuth, getPost)
router.post(main + '/addcomment',userAuth, addComment)
router.get(main + '/user/:username',userAuth, getUserPosts)
router.post(main + '/deletepost',userAuth, deletePost)

router.post(main + '/addfavorite',userAuth , addToFavorite)
router.post(main + '/deletefavorite',userAuth , deleteFavorite)

router.post(main + '/deleteuser',userAuth , deleteUser)

router.post(main + '/sendmessage',userAuth , sendMessage)
router.get(main + '/getmessage',userAuth , getMessage)
router.post(main + '/deletemessage',userAuth , deleteMessage)
router.post(main + '/deletechat',userAuth , deleteChat)

module.exports = router;