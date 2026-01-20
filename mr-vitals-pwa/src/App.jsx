import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Analysis from './pages/Analysis'

import AtlasOverlay from './components/Atlas/AtlasOverlay'

export default function App() {
    return (
        <Router>
            <AtlasOverlay />
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/home" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
            </Routes>
        </Router>
    )
}
