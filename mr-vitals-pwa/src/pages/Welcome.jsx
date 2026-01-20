import React from 'react'
import { useNavigate } from 'react-router-dom'
import WelcomePage from '../components/WelcomePage'

export default function Welcome() {
    const navigate = useNavigate()

    return <WelcomePage onEnter={() => navigate('/home')} />
}
