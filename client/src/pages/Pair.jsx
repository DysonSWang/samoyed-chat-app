import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Pair() {
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState('')
  const [acceptCode, setAcceptCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [coupleInfo, setCoupleInfo] = useState(null)

  useEffect(() => {
    checkCoupleStatus()
  }, [])

  const checkCoupleStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get('/api/auth/couple')
      
      if (response.data.success && response.data.couple) {
        setCoupleInfo(response.data.couple)
      }
    } catch (err) {
      console.error('检查配对状态失败:', err)
    }
  }

  const generateInvite = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.post('/api/auth/generate-invite', {})
      
      if (response.data.success) {
        setInviteCode(response.data.inviteCode)
        setSuccess('邀请码已生成！分享给你的 TA 吧～')
      }
    } catch (err) {
      setError(err.response?.data?.error || '生成邀请码失败')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await api.post('/api/auth/accept-invite', {
        inviteCode: acceptCode.trim().toUpperCase()
      })
      
      if (response.data.success) {
        setSuccess('🎉 绑定成功！即将进入聊天室...')
        setTimeout(() => {
          navigate('/chat')
        }, 1500)
      }
    } catch (err) {
      setError(err.response?.data?.error || '邀请码无效')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setSuccess('邀请码已复制到剪贴板！')
  }

  if (coupleInfo && coupleInfo.status === 'accepted') {
    return (
      <div className="page pair-page">
        <div className="pair-success animate-fade-in">
          <div className="success-icon">🎉</div>
          <h2>绑定成功！</h2>
          <p>一起记录毛孩子的成长点滴</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/chat')}
          >
            进入聊天室 🐕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page pair-page">
      <div className="paw-print paw-print-1">🐾</div>
      <div className="paw-print paw-print-2">🐾</div>
      
      <div className="pair-container animate-fade-in">
        <div className="pair-header">
          <div className="logo">🐕</div>
          <h1>绑定关系</h1>
          <p>邀请你的家人一起加入</p>
        </div>

        <div className="pair-sections">
          {/* 生成邀请码 */}
          <div className="card pair-card">
            <h3>📤 生成邀请码</h3>
            <p className="section-desc">生成专属邀请码，分享给家人</p>
            
            {inviteCode ? (
              <div className="invite-code-display">
                <div className="code">{inviteCode}</div>
                <button className="btn btn-secondary" onClick={copyInviteCode}>
                  复制
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={generateInvite}
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : '生成邀请码'}
              </button>
            )}
          </div>

          {/* 接受邀请 */}
          <div className="card pair-card">
            <h3>📥 接受邀请</h3>
            <p className="section-desc">输入家人分享给你的邀请码</p>
            
            <div className="form-group">
              <input
                type="text"
                className="input"
                value={acceptCode}
                onChange={(e) => setAcceptCode(e.target.value)}
                placeholder="输入 8 位邀请码"
                maxLength="8"
              />
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={acceptInvite}
              disabled={loading || acceptCode.length < 8}
            >
              {loading ? <span className="loading"></span> : '确认配对 💕'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="samoyed-tips">
          <div className="tip-emoji">🦊</div>
          <p>
            <strong>小贴士：</strong>
            邀请码 8 位字母数字组合，分享给你的 TA 即可绑定关系。
          </p>
        </div>
      </div>
    </div>
  )
}
