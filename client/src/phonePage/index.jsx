import React, { useEffect, useRef, useState } from 'react'
import { Input, Button } from 'antd'
import { PhoneFilled, CopyOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Peer from 'simple-peer'
import io from 'socket.io-client'
import './index.less'

const socket = io.connect('http://localhost:5050')

export default function PhonePage() {
  const [stream, setStream] = useState(null)
  const [thisName, setThisName] = useState('')
  const [thatName, setThatName] = useState('')
  const [thisId, setThisId] = useState('')
  const [thatId, setThatId] = useState('')
  const [inCall, setInCall] = useState(false)
  const [inReceving, setInReceving] = useState(false)
  const [callerId, setCallerId] = useState('')
  const [thatSignal, setThatSignal] = useState(null)

  const thisRef = useRef()
  const thatRef = useRef()

  const connectionRef = useRef()

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((res) => {
        setStream(res)
        thisRef.current.srcObject = res
      })
      .catch((err) => {
        console.log(err)
      })

    socket.on('me', (id) => {
      setThisId(id)
    })

    socket.on('callUser', (data) => {
      setInReceving(true)
      setCallerId(data.from)
      setThatName(data.name)
      setThatSignal(data.signal)
    })

    socket.on('stopCall', () => {
      afterStop()
    })
  }, [])

  const makePhoneCall = (id) => {
    const peer = new Peer({
      initiator: true,
      stream,
      trickle: false,
    })

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: thisId,
        name: thisName,
      })
    })

    peer.on('stream', (res) => {
      thatRef.current.srcObject = res
    })

    // 当接听方同意通话后获取信令
    socket.on('callAccepted', (signal) => {
      setCallerId(id)
      setInCall(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const answerCall = () => {
    setInCall(true)
    setInReceving(false)
    const peer = new Peer({
      initiator: false,
      stream,
      trickle: false,
    })

    peer.on('signal', (data) => {
      socket.emit('answerCall', {
        signal: data,
        to: callerId,
      })
    })

    peer.on('stream', (res) => {
      thatRef.current.srcObject = res
    })

    peer.signal(thatSignal)

    connectionRef.current = peer
  }

  const stopCall = () => {
    socket.emit('stopCall', callerId)
    afterStop()
  }

  const afterStop = () => {
    setInCall(false)
    setInReceving(false)
    setCallerId('')
    connectionRef.current.destroy()
    thisRef.current = null
    thatRef.current = null
  }

  return (
    <div className="container">
      <h1 className="title">在线视频通话</h1>
      <div className="video-container">
        <div className="that-video">
          <video playsInline autoPlay ref={thatRef} />
        </div>
        <div className="this-container">
          <div className="this-video">
            <video playsInline muted autoPlay ref={thisRef} />
          </div>
          <div className="input-pannel">
            <Input
              placeholder="请输入您的昵称"
              value={thisName}
              onChange={(e) => setThisName(e.target.value)}
            />
            <CopyToClipboard text={thisId} className="clip">
              <Button
                icon={<CopyOutlined style={{ fontSize: '15px' }} />}
                type="primary"
              >
                我的通话ID
              </Button>
            </CopyToClipboard>
            <Input
              placeholder="请输入需要拨打的ID"
              value={thatId}
              onChange={(e) => setThatId(e.target.value)}
            />
            <div>
              {inCall ? (
                <Button type="primary" danger onClick={stopCall}>
                  结束通话
                </Button>
              ) : (
                <div
                  className="phone-container"
                  onClick={() => makePhoneCall(thatId)}
                >
                  <PhoneFilled
                    style={{
                      fontSize: '28px',
                      color: '#7DAEAC',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {inReceving && (
        <div className="be-calling">
          <h2>{thatName}正在呼叫...</h2>
          <Button type="primary" onClick={answerCall}>
            同意接听
          </Button>
        </div>
      )}
    </div>
  )
}
