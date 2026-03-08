import { useState, useEffect, useRef } from 'react'
import ImagePreview from './ImagePreview'
import SamoyedIcon from './SamoyedIcon'

export default function MessageList({ messages, currentUserId, partnerTyping, onDeleteMessages, onRecallMessage, onReply }) {
  const [previewImage, setPreviewImage] = useState(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState([])
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [menuMessageId, setMenuMessageId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, partnerTyping])

  const formatTime = (timestamp) => {
    // 服务器存储的是北京时间，直接解析
    const date = new Date(timestamp)
    const now = new Date()
    
    // 获取时间字符串 (HH:mm)
    const timeStr = date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    
    // 获取日期部分（按北京时间）
    const dateStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    const nowDateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    
    // 计算昨天的日期字符串
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayDateStr = yesterday.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    
    if (dateStr === nowDateStr) {
      // 今天：只显示时间
      return timeStr
    } else if (dateStr === yesterdayDateStr) {
      // 昨天：显示"昨天 HH:mm"
      return `昨天 ${timeStr}`
    } else {
      // 计算相差天数
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 7) {
        // 7 天内：显示"星期 X HH:mm"
        const weekday = date.toLocaleDateString('zh-CN', { weekday: 'long' })
        return `${weekday} ${timeStr}`
      } else {
        // 超过 7 天：显示"月/日 HH:mm"
        const monthDay = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
        return `${monthDay} ${timeStr}`
      }
    }
  }

  const handleLongPress = (e, message) => {
    e.preventDefault()
    const timer = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMenuPosition({
        x: rect.left,
        y: rect.top - 10
      })
      setMenuMessageId(message.id)
      setShowMenu(true)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleDelete = () => {
    if (menuMessageId) {
      onDeleteMessages?.([menuMessageId])
      setShowMenu(false)
      setMenuMessageId(null)
    }
  }

  const handleRecall = () => {
    if (menuMessageId) {
      onRecallMessage?.(menuMessageId)
      setShowMenu(false)
      setMenuMessageId(null)
    }
  }

  const handleReply = () => {
    if (menuMessageId) {
      const message = messages.find(m => m.id === menuMessageId)
      if (message) {
        onReply?.(message)
      }
      setShowMenu(false)
      setMenuMessageId(null)
    }
  }

  const toggleSelectMode = () => {
    setSelectMode(!selectMode)
    setSelectedMessages([])
    setShowMenu(false)
  }

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }

  const handleBatchDelete = () => {
    if (selectedMessages.length > 0) {
      onDeleteMessages?.(selectedMessages)
      setSelectedMessages([])
      setSelectMode(false)
    }
  }

  const renderMessageContent = (message) => {
    // 处理撤回的消息
    if (message.is_recalled) {
      return (
        <div className="recalled-message">
          <span className="recalled-icon">↩️</span>
          <span className="recalled-text">
            {message.sender_id === currentUserId ? '你撤回了一条消息' : '对方撤回了一条消息'}
          </span>
        </div>
      )
    }
    
    if (message.type === 'image') {
      return (
        <div 
          className="media-message"
          onClick={() => setPreviewImage({ src: message.media_url, type: 'image' })}
        >
          <img src={message.media_url} alt="图片消息" loading="lazy" />
        </div>
      )
    }
    
    if (message.type === 'video') {
      return (
        <div 
          className="media-message"
          onClick={() => setPreviewImage({ src: message.media_url, type: 'video' })}
        >
          <video src={message.media_url} preload="metadata" />
          <div className="video-play-icon">▶️</div>
        </div>
      )
    }
    
    if (message.type === 'emoji') {
      return (
        <div className="emoji-message">
          <span className="emoji-character">{message.content}</span>
          {message.emojiName && <span className="emoji-caption">{message.emojiName}</span>}
        </div>
      )
    }
    
    // 引用消息
    if (message.reply_to_id || message.replyToId) {
      const replyContent = message.reply_content || '[原消息已删除]'
      const replySender = message.reply_sender_id === message.sender_id ? '自己' : '对方'
      
      return (
        <div className="message-with-reply">
          <div className="reply-preview">
            <span className="reply-label">@{replySender}:</span>
            <span className="reply-text">{replyContent?.substring(0, 50)}</span>
          </div>
          <p className="message-content">{message.content}</p>
        </div>
      )
    }
    
    // 悄悄话
    if (message.is_secret) {
      return (
        <div className="secret-message">
          <span className="secret-icon">🔥</span>
          <p className="message-content">{message.content}</p>
          <span className="secret-tip">阅后即焚</span>
        </div>
      )
    }
    
    return <p className="message-content">{message.content}</p>
  }

  return (
    <>
      <div className="message-list">
        {selectMode && (
          <div className="select-toolbar">
            <span className="select-count">已选择 {selectedMessages.length} 条</span>
            <button className="select-cancel" onClick={() => setSelectMode(false)}>取消</button>
            <button 
              className="select-delete" 
              onClick={handleBatchDelete}
              disabled={selectedMessages.length === 0}
            >
              删除
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-emoji">
              <SamoyedIcon size="64" />
            </div>
            <p>还没有消息</p>
            <p>发送第一条消息，开始记录吧！</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${message.sender_id === currentUserId ? 'sent' : 'received'} ${selectMode && selectedMessages.includes(message.id) ? 'selected' : ''}`}
              onClick={() => selectMode && toggleSelectMessage(message.id)}
              onTouchStart={(e) => handleLongPress(e, message)}
              onTouchEnd={handleLongPressEnd}
              onMouseDown={(e) => handleLongPress(e, message)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
            >
              <div className="message-bubble">
                {renderMessageContent(message)}
                <div className="message-time">
                  {formatTime(message.created_at)}
                </div>
              </div>
            </div>
          ))
        )}

        {partnerTyping && (
          <div className="message-item received">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span>对方正在输入</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showMenu && menuMessageId && (
        <>
          <div className="menu-overlay" onClick={() => setShowMenu(false)}></div>
          <div 
            className="message-menu"
            style={{ left: menuPosition.x, top: menuPosition.y }}
          >
            <button onClick={handleReply}>
              <span>↗️</span> 引用
            </button>
            <button onClick={toggleSelectMode}>
              <span>☑️</span> 多选
            </button>
            <button onClick={handleRecall}>
              <span>↩️</span> 撤回
            </button>
            <button onClick={handleDelete}>
              <span>🗑️</span> 删除
            </button>
          </div>
        </>
      )}

      {previewImage && (
        <ImagePreview 
          src={previewImage.src}
          type={previewImage.type}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  )
}
