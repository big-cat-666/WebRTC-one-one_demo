import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import './index.less'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="homepage-container">
      <Button type="primary" onClick={() => navigate('/videoCalling')}>
        跳转到视频通话
      </Button>
      <Button type="primary" onClick={() => navigate('/screenSharing')}>
        跳转到屏幕分享
      </Button>
    </div>
  )
}
