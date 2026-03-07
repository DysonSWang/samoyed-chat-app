import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Pair from './pages/Pair'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={token ? <Navigate to="/chat" /> : <Login onLogin={setToken} />} 
          />
          <Route 
            path="/register" 
            element={token ? <Navigate to="/chat" /> : <Register onRegister={setToken} />} 
          />
          <Route 
            path="/pair" 
            element={token ? <Pair /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat" 
            element={token ? <Chat token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={token ? "/chat" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
