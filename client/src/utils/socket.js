import { io } from 'socket.io-client'

class SocketManager {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 1000
    this.messageQueue = []
    this.listeners = new Map()
    this.heartbeatTimer = null
    this.heartbeatInterval = 30000 // 30 秒心跳
  }

  // 连接 Socket
  connect(token, userId, coupleId) {
    if (this.socket?.connected) {
      console.log('Socket 已连接')
      return this.socket
    }

    const baseURL = import.meta.env.VITE_API_URL || window.location.origin
    const socketUrl = baseURL.replace('http', 'ws').replace('https', 'wss')

    console.log('连接 Socket:', socketUrl)

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: false, // 禁用自动重连，使用自定义重连
      auth: { token }
    })

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ Socket 连接成功')
      this.connected = true
      this.reconnectAttempts = 0
      
      // 加入聊天室
      this.socket.emit('join', { userId, coupleId })
      
      // 发送心跳
      this.startHeartbeat()
      
      // 重连后同步离线消息
      this.emit('offline_sync', { userId, coupleId })
    })

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket 断开:', reason)
      this.connected = false
      this.stopHeartbeat()
      
      // 尝试重连
      if (reason !== 'io client disconnect') {
        this.scheduleReconnect(token, userId, coupleId)
      }
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('Socket 连接错误:', error)
      this.scheduleReconnect(token, userId, coupleId)
    })

    // 接收新消息
    this.socket.on('new_message', (message) => {
      this.emit('message', message)
    })

    // 对方正在输入
    this.socket.on('user_typing', (data) => {
      this.emit('typing', data)
    })

    // 对方停止输入
    this.socket.on('user_stop_typing', (data) => {
      this.emit('stop_typing', data)
    })

    // 用户在线/离线
    this.socket.on('user_online', (data) => {
      this.emit('online', data)
    })

    this.socket.on('user_offline', (data) => {
      this.emit('offline', data)
    })

    // 悄悄话自动删除通知
    this.socket.on('message_deleted', (data) => {
      this.emit('message_deleted', data)
    })

    // 戳一戳
    this.socket.on('poke', (data) => {
      this.emit('poke', data)
    })

    this.socket.connect()
    return this.socket
  }

  // 计划重连
  scheduleReconnect(token, userId, coupleId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ 重连次数已达上限')
      this.emit('reconnect_failed')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    console.log(`🔄 ${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect(token, userId, coupleId)
    }, delay)
  }

  // 发送消息（带队列）
  send(event, data) {
    if (this.connected && this.socket) {
      this.socket.emit(event, data)
      return true
    } else {
      // 加入队列
      console.log('⚠️ Socket 未连接，消息加入队列')
      this.messageQueue.push({ event, data, timestamp: Date.now() })
      
      // 限制队列大小
      if (this.messageQueue.length > 100) {
        this.messageQueue.shift()
      }
      
      return false
    }
  }

  // 发送并等待确认
  async sendWithAck(event, data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.connected && this.socket) {
        this.socket.emit(event, data, (response) => {
          resolve(response)
        })
        
        // 超时处理
        setTimeout(() => {
          reject(new Error('消息发送超时'))
        }, timeout)
      } else {
        // 加入队列
        this.messageQueue.push({ event, data, timestamp: Date.now(), needsAck: true })
        reject(new Error('Socket 未连接，消息已加入队列'))
      }
    })
  }

  // 刷新队列（重连后发送）
  flushQueue() {
    if (!this.connected || this.messageQueue.length === 0) return

    console.log(`📤 发送队列中的 ${this.messageQueue.length} 条消息`)

    const queue = [...this.messageQueue]
    this.messageQueue = []

    queue.forEach(({ event, data }) => {
      this.socket.emit(event, data)
    })
  }

  // 事件监听
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    // 同时监听 socket 事件
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (callback) {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
      if (this.socket) {
        this.socket.off(event, callback)
      }
    } else {
      this.listeners.delete(event)
      if (this.socket) {
        this.socket.off(event)
      }
    }
  }

  emit(event, ...args) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(cb => cb(...args))
    }
  }

  // 加入聊天室
  join(userId, coupleId) {
    this.send('join', { userId, coupleId })
  }

  // 发送消息
  sendMessage(coupleId, message) {
    return this.sendWithAck('send_message', { coupleId, message })
  }

  // 输入状态
  sendTyping(coupleId, userId) {
    this.send('typing', { coupleId, userId })
  }

  // 停止输入
  sendStopTyping(coupleId, userId) {
    this.send('stop_typing', { coupleId, userId })
  }

  // 戳一戳
  sendPoke(coupleId, userId) {
    this.send('poke', { coupleId, userId })
  }

  // 悄悄话
  sendSecretMessage(coupleId, message) {
    return this.sendWithAck('secret_message', { coupleId, message })
  }

  // 引用回复
  sendReply(coupleId, message, replyToId) {
    return this.sendWithAck('send_message', { 
      coupleId, 
      message: { ...message, replyToId }
    })
  }

  // 心跳
  startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connected) {
        this.socket.emit('ping')
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 断开连接
  disconnect() {
    this.stopHeartbeat()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.connected = false
  }
}

// 单例模式
const socketManager = new SocketManager()

export default socketManager
