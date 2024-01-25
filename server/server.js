import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'

const app = express()
const server = http.createServer(app)

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// 服务器socket链接
io.on('connection', (socket) => {
  // 向客户端发送id
  socket.emit('me', socket.id)

  socket.on('callUser', (data) => {
    // 将数据传递给通信的接听方
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    })
  })

  // 一方接受通话后，告知另一方对方已接听
  socket.on('answerCall', (data) => {
    // 将数据传递给通信的发起方
    io.to(data.to).emit('callAccepted', data.signal)
  })

  // 一方断开通话时，向另一方发送通知
  socket.on('stopCall', (data) => {
    io.to(data).emit('stopCall')
  })
})

server.listen(5050, () => {
  console.log('服务器在5050端口运行....')
})
