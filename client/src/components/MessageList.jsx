import { useEffect, useRef } from 'react'

export default function MessageList({ messages, currentUserId, partnerTyping }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, partnerTyping])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const renderMessageContent = (message) => {
    if (message.type === 'image') {
      return (
        <div className="media-message">
          <img src={message.media_url} alt="图片消息" />
          {message.content && <p className="message-caption">{message.content}</p>}
        </div>
      )
    }
    
    if (message.type === 'video') {
      return (
        <div className="media-message">
          <video src={message.media_url} controls />
          {message.content && <p className="message-caption">{message.content}</p>}
        </div>
      )
    }
    
    return <p className="message-content">{message.content}</p>
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <div className="empty-chat-emoji">🐕</div>
          <p>还没有消息</p>
          <p>发送第一条消息，开始你们的对话吧！</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`message-item ${message.sender_id === currentUserId ? 'sent' : 'received'}`}
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
  )
}
