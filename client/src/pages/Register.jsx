import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Register({ onRegister }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname || formData.username
      })
      
      if (response.data.success) {
        onRegister(response.data.token)
        navigate('/pair')
      }
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page register-page">
      <div className="paw-print paw-print-3">🐾</div>
      <div className="paw-print paw-print-4">🐾</div>
      
      <div className="auth-container animate-fade-in">
        <div className="auth-header">
          <div className="logo">🐕</div>
          <h1>加入我们</h1>
          <p>记录你和毛孩子的日常</p>
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
            <label>昵称（可选）</label>
            <input
              type="text"
              className="input"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              placeholder="对方怎么称呼你"
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

          <div className="form-group">
            <label>确认密码</label>
            <input
              type="password"
              className="input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="请再次输入密码"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading"></span> : '注册 💕'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            已有账号？<Link to="/login">立即登录</Link>
          </p>
        </div>

        <div className="samoyed-decoration">
          <div className="samoyed-emoji">🦊</div>
          <p>在这里，每个瞬间都被温柔记录</p>
        </div>
      </div>
    </div>
  )
}
