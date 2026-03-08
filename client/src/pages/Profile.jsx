import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Profile.css'

export default function Profile({ token, onLogout }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [couple, setCouple] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const userRes = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (userRes.data.success) {
        setUser(userRes.data.user)
        
        const coupleRes = await axios.get('/api/auth/couple', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (coupleRes.data.success) {
          setCouple(coupleRes.data.couple)
        }
      }
    } catch (err) {
      console.error('加载用户信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('头像大小不能超过 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        await axios.put('/api/auth/avatar', { 
          avatar: response.data.url 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        setUser(prev => ({ ...prev, avatar: response.data.url }))
        alert('头像已更新')
      }
    } catch (err) {
      console.error('上传失败:', err)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="page profile-page">
        <div className="loading-container">
          <div className="loading-emoji">🐕</div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  const partnerInfo = couple ? (
    couple.user1_id === user?.id 
      ? { username: couple.user2_username, nickname: couple.user2_nickname }
      : { username: couple.user1_username, nickname: couple.user1_nickname }
  ) : null

  return (
    <div className="page profile-page">
      <div className="profile-header">
        <h1>我的</h1>
      </div>

      <div className="profile-content">
        {/* 用户信息卡片 */}
        <div className="profile-card">
          <div className="user-info">
            <label className="avatar-container">
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="头像" />
                ) : (
                  '🐕'
                )}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
              {uploading && <div className="uploading-badge">上传中...</div>}
            </label>
            
            <div className="user-details">
              <h2>{user?.nickname || user?.username}</h2>
              <p className="username">@{user?.username}</p>
            </div>
          </div>
          
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-value">📝</span>
              <span className="stat-label">聊天记录</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">🐾</span>
              <span className="stat-label">陪伴天数</span>
            </div>
          </div>
        </div>

        {/* 绑定关系 */}
        {couple && (
          <div className="profile-card">
            <h3 className="card-title">绑定关系</h3>
            <div className="relation-info">
              <div className="relation-avatar">
                🐕
              </div>
              <div className="relation-details">
                <h4>{partnerInfo?.nickname || partnerInfo?.username}</h4>
                <p>已绑定</p>
              </div>
            </div>
          </div>
        )}

        {!couple && (
          <div className="profile-card">
            <h3 className="card-title">绑定关系</h3>
            <button 
              className="bind-btn"
              onClick={() => navigate('/pair')}
            >
              去绑定
            </button>
          </div>
        )}

        {/* 设置 */}
        <div className="profile-card">
          <h3 className="card-title">设置</h3>
          <div className="menu-list">
            <button className="menu-item">
              <span className="menu-icon">🔔</span>
              <span>消息通知</span>
              <span className="menu-arrow">›</span>
            </button>
            <button className="menu-item">
              <span className="menu-icon">🔒</span>
              <span>隐私设置</span>
              <span className="menu-arrow">›</span>
            </button>
            <button className="menu-item">
              <span className="menu-icon">❓</span>
              <span>帮助与反馈</span>
              <span className="menu-arrow">›</span>
            </button>
            <button className="menu-item">
              <span className="menu-icon">ℹ️</span>
              <span>关于</span>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        </div>

        {/* 退出登录 */}
        <button className="logout-button" onClick={handleLogout}>
          退出登录
        </button>

        <div className="version-info">
          <p>萨摩耶之家 v1.0.0</p>
          <p>陪伴是最长情的告白 🐾</p>
        </div>
      </div>
    </div>
  )
}
