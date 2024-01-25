import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './page/homePage'
import VideoPhonePage from './page/videoPhonePage'
import ScreenSharingPage from './page/screenSharingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/videoCalling" element={<VideoPhonePage />} />
        <Route path="/screenSharing" element={<ScreenSharingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
