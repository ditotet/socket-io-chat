const express = require('express')
const app = express() 
const server = require('http').createServer(app)
const io = require('socket.io').listen(server)


users = []
connections = []

server.listen(3000, () => {
    console.log('Listening on port 3000')
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.sockets.on('connection', (socket) => {
    connections.push(socket)
    console.log(`Connected: ${connections.length} sockets connected`)
    
    socket.on('disconnect', (data) => {
        connections.splice(connections.indexOf(socket), 1)
        console.log(`Disconnected: ${connections.length} sockets connected`)
        users = users.filter((usr) => usr != socket.userName)
        io.sockets.emit('get users', {users: users})
    })
    
    socket.on('send message', (data) => {
        io.sockets.emit('new message', {msg: data, sender: socket.userName})
    })

    socket.on('new user', (data, callback) => {
        if (data === '') {
            return
        }
        if (users.includes(data)) {
            callback(true)
        } else {
            callback(false)
            users.push(data)
            socket.userName = data
            io.sockets.emit('get users', {users: users})
        }
    })

})