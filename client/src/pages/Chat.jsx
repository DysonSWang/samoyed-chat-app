import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import io from 'socket.io-client'
import MessageInput from '../components/MessageInput'
import MessageList from '../components/MessageList'
import ChatHeader from '../components/ChatHeader'
import './Chat.css'

let socket = null

export default function Chat({ token }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [couple, setCouple] = useState(null)
  const [messages, setMessages] = useState([])
  const [online, setOnline] = useState(false)
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  const socketInitialized = useRef(false)

  useEffect(() => {
    // 初始化 Socket 连接
    if (!socketInitialized.current) {
      // 使用相对路径，通过 Vite 代理连接到后端
      const serverUrl = window.location.origin
      
      console.log('连接 Socket 服务器:', serverUrl)
      
      socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
        path: '/socket.io'
      })
      
      socketInitialized.current = true
    }

    initChat()

    return () => {
      console.log('Chat component unmounted')
    }
  }, [])

  const initChat = async () => {
    try {
      console.log('开始初始化聊天，API base:', api.defaults.baseURL || '相对路径')
      const userRes = await api.get('/api/auth/me')
      console.log('用户信息:', userRes.data)
      
      if (userRes.data.success) {
        setUser(userRes.data.user)
        
        const coupleRes = await api.get('/api/auth/couple')
        console.log('情侣信息:', coupleRes.data)
        
        if (coupleRes.data.success && coupleRes.data.couple) {
          setCouple(coupleRes.data.couple)
          await loadMessages()
          
          socket.emit('join', {
            userId: userRes.data.user.id,
            coupleId: coupleRes.data.couple.id
          })
          
          setOnline(true)
        } else {
          // 未绑定情侣，跳转到配对页面
          console.log('未绑定情侣，跳转到配对页面')
          navigate('/pair', { replace: true })
          return
        }
      }
    } catch (err) {
      console.error('初始化聊天失败:', err)
      console.error('错误详情:', {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data
      })
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        // 网络错误，清除 token 并跳转到登录页
        console.error('网络错误，无法连接后端 API')
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await api.get('/api/messages')
      
      if (response.data.success) {
        setMessages(response.data.messages)
      }
    } catch (err) {
      console.error('加载消息失败:', err)
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message) => {
      console.log('收到新消息:', message)
      setMessages(prev => {
        const exists = prev.find(m => m.id === message.id)
        if (exists) {
          console.log('消息已存在，跳过')
          return prev
        }
        return [...prev, message]
      })
    }

    socket.on('new_message', handleNewMessage)

    socket.on('user_online', () => {
      console.log('对方上线')
      setPartnerOnline(true)
    })

    socket.on('user_offline', () => {
      console.log('对方下线')
      setPartnerOnline(false)
    })

    socket.on('user_typing', () => {
      setPartnerTyping(true)
    })

    socket.on('user_stop_typing', () => {
      setPartnerTyping(false)
    })

    socket.on('connect', () => {
      console.log('Socket 已连接:', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('Socket 已断开')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket 连接错误:', err)
    })

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_online')
      socket.off('user_offline')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
    }
  }, [socket])

  const sendMessage = async (messageData) => {
    try {
      const response = await api.post('/api/messages', messageData)
      
      if (response.data.success) {
        // 先添加到本地列表
        setMessages(prev => [...prev, response.data.message])
        
        // 通过 socket 发送给对方
        if (socket && socket.connected) {
          socket.emit('send_message', {
            coupleId: couple.id,
            message: response.data.message
          })
          console.log('消息已发送到 socket')
        } else {
          console.warn('Socket 未连接，无法实时推送')
        }
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      alert('发送失败，请重试')
    }
  }

  const sendTypingStatus = (isTyping) => {
    // 未绑定时不发送输入状态
    if (!couple || !user) return
    
    if (isTyping) {
      socket.emit('typing', { coupleId: couple.id, userId: user.id })
    } else {
      socket.emit('stop_typing', { coupleId: couple.id, userId: user.id })
    }
  }

  const handleDeleteMessages = async (messageIds) => {
    try {
      for (const id of messageIds) {
        await api.delete(`/api/messages/${id}`)
      }
      setMessages(prev => prev.filter(m => !messageIds.includes(m.id)))
    } catch (err) {
      console.error('删除失败:', err)
      alert('删除失败，请重试')
    }
  }

  const handleRecallMessage = async (messageId) => {
    try {
      const response = await api.post(`/api/messages/${messageId}/recall`)
      
      if (response.data.success) {
        // 更新本地消息状态
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { ...m, is_recalled: 1, content: '', media_url: null, type: 'text' }
            : m
        ))
      }
    } catch (err) {
      console.error('撤回失败:', err)
      alert(err.response?.data?.error || '撤回失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="page chat-page">
        <div className="loading-container">
          <div className="loading-emoji">🐕</div>
          <p>正在连接...</p>
        </div>
      </div>
    )
  }

  // 未绑定时不渲染聊天界面（会立即跳转）
  if (!couple || !user) {
    return (
      <div className="page chat-page">
        <div className="loading-container">
          <div className="loading-emoji">🐕</div>
          <p>正在跳转...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page chat-page">
      <ChatHeader 
        couple={couple} 
        partnerOnline={partnerOnline}
      />
      
      <MessageList 
        messages={messages}
        currentUserId={user.id}
        partnerTyping={partnerTyping}
        onDeleteMessages={handleDeleteMessages}
        onRecallMessage={handleRecallMessage}
      />
      
      <MessageInput 
        token={token}
        coupleId={couple.id}
        onSendMessage={sendMessage}
        onTyping={sendTypingStatus}
      />
    </div>
  )
}
