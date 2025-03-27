
let users = [];


module.exports = {
    addUser: (user) => {
        users.push(user);
        return users;
    },
    getUsers: () => {
        return users;
    },
    removeUser: (socked_id) => {
        users = users.filter(x => x.socket_id !== socked_id);
    },
    getUser: (_id) => {
        return users.find(x => x._id === _id);
    },
    getUserSocket: (_id) => {
        return users.find(x => x.socket_id === _id);
    },
    setUserSel: (_id, sel) => {
        let myUser = users.find(x => x.socket_id === _id);
        myUser.selected = sel
    },



}