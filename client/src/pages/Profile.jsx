import { useState, useEffect } from 'react'
import SamoyedIcon from '../components/SamoyedIcon'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './Profile.css'

export default function Profile({ token, onLogout }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [couple, setCouple] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [editNickname, setEditNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [showManagePanel, setShowManagePanel] = useState(false)

  useEffect(() => {
    loadUserInfo()
  }, [])

  useEffect(() => {
    if (user) {
      setEditNickname(user.nickname || '')
    }
  }, [user])

  const loadUserInfo = async () => {
    try {
      const userRes = await api.get('/api/auth/me')
      
      if (userRes.data.success) {
        setUser(userRes.data.user)
        
        const coupleRes = await api.get('/api/auth/couple')
        
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
      
      const response = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        await api.put('/api/auth/avatar', { 
          avatar: response.data.url 
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

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      alert('昵称不能为空')
      return
    }

    setSaving(true)
    try {
      const response = await api.put('/api/auth/profile', {
        nickname: editNickname.trim()
      })

      if (response.data.success) {
        setUser(prev => ({ 
          ...prev, 
          nickname: editNickname.trim()
        }))
        setShowEditPanel(false)
        alert('保存成功')
      }
    } catch (err) {
      console.error('保存失败:', err)
      alert(err.response?.data?.error || '保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleUnbind = async () => {
    if (!window.confirm('确定要解除绑定关系吗？\n\n解除后需要重新生成邀请码才能再次绑定。')) {
      return
    }

    try {
      const response = await api.post('/api/auth/unbind')

      if (response.data.success) {
        setCouple(null)
        setShowManagePanel(false)
        alert('已解除绑定关系')
      }
    } catch (err) {
      console.error('解除绑定失败:', err)
      alert(err.response?.data?.error || '解除绑定失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="page profile-page">
        <div className="loading-container">
          <div className="loading-emoji">
            <SamoyedIcon size="64" />
          </div>
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
                  <SamoyedIcon size="48" />
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
              <button 
                className="edit-btn"
                onClick={() => setShowEditPanel(true)}
              >
                ✏️ 编辑资料
              </button>
            </div>
          </div>
          
        </div>

        {/* 绑定关系 */}
        {couple && (
          <div className="profile-card">
            <h3 className="card-title">绑定关系</h3>
            <div className="relation-info">
              <div className="relation-details">
                <h4>{partnerInfo?.nickname || partnerInfo?.username}</h4>
                <p className="relation-status">✅ 已绑定</p>
              </div>
              <button 
                className="unbind-btn"
                onClick={() => setShowManagePanel(true)}
              >
                管理
              </button>
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

        {/* 退出登录 */}
        <button className="logout-button" onClick={handleLogout}>
          退出登录
        </button>

        <div className="version-info">
          <p>萨摩耶之家 v1.0.0</p>
          <p>陪伴是最长情的告白 🐾</p>
        </div>
      </div>

      {/* 编辑资料面板 */}
      {showEditPanel && (
        <>
          <div className="panel-overlay" onClick={() => setShowEditPanel(false)}></div>
          <div className="edit-panel">
            <div className="panel-header">
              <h3>编辑资料</h3>
              <button className="panel-close" onClick={() => setShowEditPanel(false)}>✕</button>
            </div>
            <div className="panel-content">
              <div className="edit-avatar-section">
                <label className="edit-avatar-label">
                  <div className="edit-avatar-preview">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="头像" />
                    ) : (
                      <SamoyedIcon size="64" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading || saving}
                    style={{ display: 'none' }}
                  />
                  <span className="edit-avatar-tip">
                    {uploading ? '上传中...' : '点击更换头像'}
                  </span>
                </label>
              </div>
              
              <div className="edit-field">
                <label>昵称</label>
                <input
                  type="text"
                  className="edit-input"
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  placeholder="请输入昵称"
                  disabled={saving}
                />
              </div>
              
              <div className="edit-field">
                <label>用户名</label>
                <div className="username-display">@{user?.username}</div>
                <p className="field-tip">用户名用于登录，不支持修改</p>
              </div>
            </div>
            <div className="panel-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowEditPanel(false)}
                disabled={saving}
              >
                取消
              </button>
              <button 
                className="btn-save"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* 绑定管理面板 */}
      {showManagePanel && couple && (
        <>
          <div className="panel-overlay" onClick={() => setShowManagePanel(false)}></div>
          <div className="manage-panel">
            <div className="panel-header">
              <h3>绑定管理</h3>
              <button className="panel-close" onClick={() => setShowManagePanel(false)}>✕</button>
            </div>
            <div className="panel-content">
              <div className="couple-info">
                <div className="couple-avatar">
                  <SamoyedIcon size="48" />
                </div>
                <div className="couple-details">
                  <h4>{partnerInfo?.nickname || partnerInfo?.username}</h4>
                  <p className="couple-status">✅ 已绑定</p>
                </div>
              </div>
              
              <div className="bind-time-section">
                <p className="bind-time-label">绑定时间</p>
                <p className="bind-time-value">
                  {couple.created_at ? (() => {
                    // 确保使用东八区（北京时间）显示
                    const date = new Date(couple.created_at)
                    // 转换为东八区时间戳
                    const utcTime = date.getTime()
                    const beijingTime = new Date(utcTime + 8 * 60 * 60 * 1000)
                    return beijingTime.toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  })() : '-'}
                </p>
              </div>
            </div>
            <div className="panel-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowManagePanel(false)}
              >
                取消
              </button>
              <button 
                className="btn-unbind"
                onClick={handleUnbind}
              >
                解除绑定
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
