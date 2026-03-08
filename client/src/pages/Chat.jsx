import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import io from 'socket.io-client'
import MessageInput from '../components/MessageInput'
import MessageList from '../components/MessageList'
import ChatHeader from '../components/ChatHeader'
import SamoyedIcon from '../components/SamoyedIcon'
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
  const [showPokeAnimation, setShowPokeAnimation] = useState(false)
  const [lastPokeTime, setLastPokeTime] = useState(0)
  const [replyTo, setReplyTo] = useState(null)

  const socketInitialized = useRef(false)
  const typingTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10

  useEffect(() => {
    if (!socketInitialized.current) {
      const serverUrl = window.location.origin
      
      console.log('🔌 连接 Socket 服务器:', serverUrl)
      
      socket = io(serverUrl, {
        reconnection: false,
        timeout: 20000,
        transports: ['websocket', 'polling'],
        path: '/socket.io'
      })
      
      socket.on('connect', () => {
        console.log('✅ Socket 连接成功')
        reconnectAttempts.current = 0
        setOnline(true)
        
        if (user && couple) {
          socket.emit('join', { userId: user.id, coupleId: couple.id })
        }
      })
      
      socket.on('disconnect', (reason) => {
        console.log('❌ Socket 断开:', reason)
        setOnline(false)
        if (reason !== 'io client disconnect') {
          scheduleReconnect()
        }
      })
      
      socket.on('connect_error', (error) => {
        console.error('Socket 连接错误:', error)
        scheduleReconnect()
      })
      
      socket.on('new_message', (message) => {
        console.log('📥 收到新消息:', message)
        setMessages(prev => [...prev, message])
      })
      
      socket.on('user_online', ({ userId }) => {
        console.log('🟢 对方在线')
        setPartnerOnline(true)
      })
      
      socket.on('user_offline', ({ userId }) => {
        console.log('⚫ 对方离线')
        setPartnerOnline(false)
      })
      
      socket.on('user_typing', ({ userId }) => {
        setPartnerTyping(true)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setPartnerTyping(false)
        }, 3000)
      })
      
      socket.on('user_stop_typing', () => {
        setPartnerTyping(false)
      })
      
      socket.on('poke', ({ userId, timestamp }) => {
        console.log('👆 被戳了一下')
        const now = Date.now()
        if (now - lastPokeTime > 1000) {
          setShowPokeAnimation(true)
          setLastPokeTime(now)
          setTimeout(() => setShowPokeAnimation(false), 2000)
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }
        }
      })
      
      socket.on('message_deleted', ({ messageId, reason }) => {
        console.log('🗑️ 消息被删除:', messageId, reason)
        setMessages(prev => prev.filter(m => m.id !== messageId))
      })
      
      socket.on('offline_messages', ({ messages }) => {
        console.log('📥 同步离线消息:', messages.length, '条')
        setMessages(messages)
      })
      
      socketInitialized.current = true
    }

    initChat()

    return () => {
      console.log('👋 Chat component unmounted')
      if (socket) {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('new_message')
        socket.off('user_online')
        socket.off('user_offline')
        socket.off('user_typing')
        socket.off('user_stop_typing')
        socket.off('poke')
        socket.off('message_deleted')
        socket.off('offline_messages')
      }
    }
  }, [])

  const scheduleReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('❌ 重连次数已达上限')
      return
    }
    
    const delay = 1000 * Math.pow(2, reconnectAttempts.current)
    reconnectAttempts.current++
    
    console.log(`🔄 ${delay}ms 后尝试重连 (${reconnectAttempts.current}/${maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (socket) {
        socket.connect()
      }
    }, delay)
  }

  const initChat = async () => {
    try {
      console.log('开始初始化聊天')
      const userRes = await api.get('/api/auth/me')
      
      if (userRes.data.success) {
        setUser(userRes.data.user)
        
        const coupleRes = await api.get('/api/auth/couple')
        
        if (coupleRes.data.success && coupleRes.data.couple) {
          setCouple(coupleRes.data.couple)
          await loadMessages()
          
          if (socket && !socket.connected) {
            socket.connect()
          }
        } else {
          console.log('未绑定情侣，跳转到配对页面')
          navigate('/pair', { replace: true })
          return
        }
      }
    } catch (err) {
      console.error('初始化聊天失败:', err)
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await api.get('/api/messages?limit=50')
      if (response.data.success) {
        setMessages(response.data.messages || [])
      }
    } catch (err) {
      console.error('加载消息失败:', err)
    }
  }

  const sendMessage = async (messageData) => {
    try {
      console.log('📤 发送消息:', messageData)
      
      const response = await api.post('/api/messages', messageData)
      
      if (response.data.success) {
        const message = response.data.message
        
        setMessages(prev => [...prev, message])
        
        if (socket && socket.connected) {
          if (messageData.isSecret) {
            socket.emit('secret_message', {
              coupleId: couple.id,
              message: message
            })
          } else if (messageData.replyTo) {
            socket.emit('reply_message', {
              coupleId: couple.id,
              message: message,
              replyToId: messageData.replyTo.id || messageData.replyTo
            })
          } else {
            socket.emit('send_message', {
              coupleId: couple.id,
              message: message
            })
          }
        }
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      alert('发送失败，请重试')
    }
  }

  const sendTypingStatus = (isTyping) => {
    if (!couple || !user) return
    
    if (isTyping) {
      socket?.emit('typing', { coupleId: couple.id, userId: user.id })
    } else {
      socket?.emit('stop_typing', { coupleId: couple.id, userId: user.id })
    }
  }

  const sendPoke = () => {
    if (!couple || !user) return
    
    const now = Date.now()
    if (now - lastPokeTime < 5000) {
      return
    }
    
    socket?.emit('poke', { coupleId: couple.id, userId: user.id })
    setLastPokeTime(now)
  }

  const handleDeleteMessages = async (messageIds) => {
    try {
      for (const id of messageIds) {
        await api.delete(`/api/messages/${id}`)
      }
      setMessages(prev => prev.filter(m => !messageIds.includes(m.id)))
    } catch (err) {
      console.error('删除消息失败:', err)
    }
  }

  const handleRecallMessage = async (messageId) => {
    try {
      await api.post(`/api/messages/${messageId}/recall`)
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, is_recalled: 1, content: '', media_url: null } : m
      ))
    } catch (err) {
      console.error('撤回消息失败:', err)
    }
  }

  const handleReply = (message) => {
    setReplyTo(message)
  }

  const cancelReply = () => {
    setReplyTo(null)
  }

  if (loading) {
    return (
      <div className="page chat-page">
        <div className="loading-container">
          <div className="loading-emoji">
            <SamoyedIcon size="64" />
          </div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page chat-page">
      <ChatHeader 
        couple={couple} 
        user={user}
        partnerOnline={partnerOnline}
        onPoke={sendPoke}
      />
      
      {showPokeAnimation && (
        <div className="poke-animation">
          <div className="poke-emoji">👆</div>
          <div className="poke-text">对方戳了你一下</div>
        </div>
      )}
      
      <MessageList 
        messages={messages}
        currentUserId={user.id}
        partnerTyping={partnerTyping}
        onDeleteMessages={handleDeleteMessages}
        onRecallMessage={handleRecallMessage}
        onReply={handleReply}
      />
      
      <MessageInput 
        token={token}
        coupleId={couple.id}
        onSendMessage={sendMessage}
        onTyping={sendTypingStatus}
        replyTo={replyTo}
        onCancelReply={cancelReply}
      />
    </div>
  )
}
