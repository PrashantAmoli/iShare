const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server)
const PORT = process.env.port || 8000

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('./client/build'))
}

io.on('connection', socket => {
	socket.emit('your id', socket.id)
	socket.on('send message', body => {
		io.emit('message', body)
	})

	socket.on('new-user', user => {
		socket.broadcast.emit('user-joined', user)
	})
	// Rooms
	socket.on('join-room', room => {
		socket.join(room)
	})
})

server.listen(PORT, () => console.log('Server is running'))
