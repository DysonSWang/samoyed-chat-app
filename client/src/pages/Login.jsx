import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/login', formData)
      if (response.data.success) {
        onLogin(response.data.token)
        navigate('/chat')
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page login-page">
      <div className="paw-print paw-print-1">🐾</div>
      <div className="paw-print paw-print-2">🐾</div>
      
      <div className="auth-container animate-fade-in">
        <div className="auth-header">
          <div className="logo">🐕</div>
          <h1>萨摩耶之家</h1>
          <p>欢迎回来，继续你和毛孩子的对话</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              className="input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名"
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="请输入密码"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading"></span> : '登录 💕'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            还没有账号？<Link to="/register">立即注册</Link>
          </p>
        </div>

        <div className="samoyed-decoration">
          <div className="samoyed-emoji">🦊</div>
          <p>像萨摩耶一样忠诚，像天使般微笑</p>
        </div>
      </div>
    </div>
  )
}
