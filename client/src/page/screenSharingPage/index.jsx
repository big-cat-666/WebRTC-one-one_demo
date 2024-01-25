import React, { useState, useEffect, useRef } from 'react'
import { Peer } from 'peerjs'
import { Input, Button } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import './index.less'

export default function ScreenSharingPage() {
  const [thisId, setThisId] = useState('')
  const [thatId, setThatId] = useState('')
  const [shareStatus, setShareStatus] = useState(0)

  const peer = useRef(new Peer())
  const myVideoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const connectionRef = useRef(null)

  useEffect(() => {
    peer.current.on('open', (peerId) => {
      setThisId(peerId)
    })
  }, [])

  useEffect(() => {
    if (!thisId) return
    peer.current.on('connection', (connection) => {
      connectionRef.current = connection
      connection.on('close', () => {
        stopScreenShare()
      })
    })
    peer.current.on('call', (call) => {
      call.answer()
      call.on('stream', (stream) => {
        console.log(stream)
        mediaStreamRef.current = stream
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream
        }
      })
      setShareStatus(2)
    })
  }, [thisId])

  const sendMediaStream = () => {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then((mediaStream) => {
        mediaStreamRef.current = mediaStream
        peer.current.call(thatId, mediaStream)
      })
    setShareStatus(1)
  }

  const sendData = () => {
    if (!thatId) return

    connectionRef.current = peer.current.connect(thatId)
    connectionRef.current.on('open', () => {
      sendMediaStream()
    })
    connectionRef.current.on('close', () => {
      stopScreenShare()
    })
  }

  const stopScreenShare = () => {
    setShareStatus(0)
    if (connectionRef.current) {
      connectionRef.current.close()
      connectionRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      mediaStreamRef.current = null
    }

    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null
    }
  }

  return (
    <div className="screen-sharing">
      <div className="input-panner">
        <CopyToClipboard text={thisId}>
          <Button type="primary">点击复制本人ID</Button>
        </CopyToClipboard>
        <div className="id-label">对方ID:</div>
        <Input
          value={thatId}
          placeholder="输入对方ID"
          onChange={(e) => setThatId(e.target.value)}
        />
        {shareStatus === 0 ? (
          <Button
            onClick={sendData}
            type="primary"
            style={{ marginTop: '10px' }}
          >
            发送
          </Button>
        ) : shareStatus === 1 ? (
          <Button
            type="primary"
            style={{ marginTop: '10px' }}
            danger
            onClick={stopScreenShare}
          >
            停止共享
          </Button>
        ) : (
          <Button
            type="primary"
            style={{ marginTop: '10px' }}
            danger
            onClick={stopScreenShare}
          >
            停止观看
          </Button>
        )}
      </div>
      <video
        ref={myVideoRef}
        playsInline
        muted
        autoPlay
        className="screen-video"
      ></video>
    </div>
  )
}
