import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import io from 'socket.io-client'
import MessageInput from '../components/MessageInput'
import MessageList from '../components/MessageList'
import ChatHeader from '../components/ChatHeader'
import './Chat.css'

const socket = io.connect(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin)

export default function Chat({ token }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [couple, setCouple] = useState(null)
  const [messages, setMessages] = useState([])
  const [online, setOnline] = useState(false)
  const [partnerOnline, setPartnerOnline] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initChat()
    return () => {
      socket.disconnect()
    }
  }, [])

  const initChat = async () => {
    try {
      // 获取用户信息
      const userRes = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (userRes.data.success) {
        setUser(userRes.data.user)
        
        // 获取配对信息
        const coupleRes = await axios.get('/api/auth/couple', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (coupleRes.data.success && coupleRes.data.couple) {
          setCouple(coupleRes.data.couple)
          
          // 获取聊天记录
          await loadMessages()
          
          // 连接 Socket
          socket.emit('join', {
            userId: userRes.data.user.id,
            coupleId: coupleRes.data.couple.id
          })
          
          setOnline(true)
        } else {
          // 未配对，跳转到配对页面
          navigate('/pair')
        }
      }
    } catch (err) {
      console.error('初始化聊天失败:', err)
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setMessages(response.data.messages)
      }
    } catch (err) {
      console.error('加载消息失败:', err)
    }
  }

  // Socket 事件监听
  useEffect(() => {
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('user_online', () => {
      setPartnerOnline(true)
    })

    socket.on('user_offline', () => {
      setPartnerOnline(false)
    })

    socket.on('user_typing', () => {
      setPartnerTyping(true)
    })

    socket.on('user_stop_typing', () => {
      setPartnerTyping(false)
    })

    return () => {
      socket.off('new_message')
      socket.off('user_online')
      socket.off('user_offline')
      socket.off('user_typing')
      socket.off('user_stop_typing')
    }
  }, [])

  const sendMessage = async (messageData) => {
    try {
      const response = await axios.post('/api/messages', messageData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        // 通过 Socket 发送
        socket.emit('send_message', {
          coupleId: couple.id,
          message: response.data.message
        })
      }
    } catch (err) {
      console.error('发送消息失败:', err)
    }
  }

  const sendTypingStatus = (isTyping) => {
    if (isTyping) {
      socket.emit('typing', { coupleId: couple.id, userId: user.id })
    } else {
      socket.emit('stop_typing', { coupleId: couple.id, userId: user.id })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    socket.disconnect()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="page chat-page">
        <div className="loading-container">
          <div className="loading-emoji">🐕</div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page chat-page">
      <ChatHeader 
        user={user} 
        couple={couple} 
        partnerOnline={partnerOnline}
        onLogout={handleLogout}
      />
      
      <MessageList 
        messages={messages}
        currentUserId={user?.id}
        partnerTyping={partnerTyping}
      />
      
      <MessageInput 
        token={token}
        coupleId={couple?.id}
        onSendMessage={sendMessage}
        onTyping={sendTypingStatus}
      />
    </div>
  )
}
