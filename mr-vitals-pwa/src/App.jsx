import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import IronManAR from './pages/IronManAR'

import AtlasOverlay from './components/Atlas/AtlasOverlay'

export default function App() {
    return (
        <Router>
            <AtlasOverlay />
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/home" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/ironman-ar" element={<IronManAR />} />
            </Routes>
        </Router>
    )
}
