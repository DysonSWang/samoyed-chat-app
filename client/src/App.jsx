import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Pair from './pages/Pair'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import './App.css'

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const currentTab = location.pathname === '/profile' ? 'profile' : 'chat'
  
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-item ${currentTab === 'chat' ? 'active' : ''}`}
        onClick={() => navigate('/chat')}
      >
        <span className="nav-icon">💬</span>
        <span className="nav-label">聊天</span>
      </button>
      <button 
        className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">我的</span>
      </button>
    </nav>
  )
}

function AppContent({ token, setToken }) {
  return (
    <>
      <div className="main-content">
        <Routes>
          <Route path="/chat" element={<Chat token={token} />} />
          <Route path="/profile" element={<Profile token={token} onLogout={() => setToken(null)} />} />
          <Route path="/pair" element={<Pair />} />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  if (!token) {
    return (
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login onLogin={setToken} />} />
            <Route path="/register" element={<Register onRegister={setToken} />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    )
  }

  return (
    <Router>
      <div className="app">
        <AppContent token={token} setToken={setToken} />
      </div>
    </Router>
  )
}

export default App
