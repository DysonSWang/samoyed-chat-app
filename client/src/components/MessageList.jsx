import { useState, useEffect, useRef } from 'react'
import ImagePreview from './ImagePreview'
import AudioMessage from './AudioMessage'

export default function MessageList({ messages, currentUserId, partnerTyping, onDeleteMessages }) {
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
    // 处理时间戳，确保使用东八区时间
    const date = new Date(timestamp)
    // 如果时间戳是 UTC 时间，转换为东八区
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    const beijingTime = new Date(utcTime + (8 * 3600000))
    
    const now = new Date()
    const diff = now - beijingTime
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return beijingTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return beijingTime.toLocaleDateString('zh-CN', { weekday: 'long' })
    } else {
      return beijingTime.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
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
    
    if (message.type === 'audio') {
      return (
        <AudioMessage 
          url={message.media_url}
          duration={message.duration}
          isOwn={message.sender_id === currentUserId}
        />
      )
    }
    
    if (message.type === 'emoji') {
      return (
        <div className="emoji-message">
          <img src={message.media_url} alt={message.content} />
          {message.content && <span className="emoji-caption">{message.content}</span>}
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
            <div className="empty-chat-emoji">🐕</div>
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
            <button onClick={toggleSelectMode}>
              <span>☑️</span> 多选
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
