
const usersOnline = require('../modules/usersOnline')
const {Server} = require("socket.io");


const io = new Server({
    cors: {
        origin: '*'
    }
});

io.on("connection", (socket) => {
    console.log("socket start on port 3011")
//     GETS EVENT FROM FRONT END SOCKET
    socket.on("login", (item) => {

        const online = usersOnline.getUsers()
        const userExist = online.find(x => x._id === item._id)
        if (userExist) return

        const user = {
            username: item.username,
            socket_id: socket.id,
            _id: item._id,
            image: item.image,
            selected: null
        }

        const users = usersOnline.addUser(user)

        io.emit("allUsers", users)

    })
    socket.on("logout", () => {
        usersOnline.removeUser(socket.id);

        const users = usersOnline.getUsers()
        io.emit("allUsers", users)
    })

    socket.on("disconnect", () => {
        usersOnline.removeUser(socket.id);

        const users = usersOnline.getUsers()
        io.emit("allUsers", users)
    })

})


module.exports = io;
