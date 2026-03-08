import { useState, useRef } from 'react'
import api from '../utils/api'
import EmojiPicker from './EmojiPicker'
import './MessageInput.css'

export default function MessageInput({ token, coupleId, onSendMessage, onTyping }) {
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const handleTyping = () => {
    onTyping?.(true)
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false)
    }, 2000)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    handleTyping()
    
    await onSendMessage({
      content: message.trim(),
      type: 'text'
    })
    
    setMessage('')
    onTyping?.(false)
    setShowPanel(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 20 * 1024 * 1024) {
      alert('文件大小不能超过 20MB')
      return
    }

    setUploading(true)
    setShowPanel(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const isVideo = file.type.startsWith('video/')
      const endpoint = isVideo ? '/api/upload/video' : '/api/upload/image'
      
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        await onSendMessage({
          content: '',
          type: isVideo ? 'video' : 'image',
          mediaUrl: response.data.url,
          mediaType: response.data.mimeType
        })
      }
    } catch (err) {
      console.error('上传失败:', err)
      const errorMsg = err.code === 'ENOTFOUND' 
        ? '网络错误，请检查连接' 
        : (err.response?.data?.error || '上传失败，请稍后重试')
      alert(errorMsg)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const openAttachmentPicker = () => {
    fileInputRef.current?.click()
    setShowPanel(false)
  }

  const openEmojiPicker = () => {
    setShowEmojiPicker(true)
    setShowPanel(false)
  }

  const handleEmojiSelect = async (emoji) => {
    setUploading(false)
    setShowEmojiPicker(false)

    try {
      // 直接发送表情包消息（使用 emoji 字符）
      await onSendMessage({
        content: emoji.emoji,
        type: 'emoji',
        emojiName: emoji.name,
        mediaType: 'emoji'
      })
    } catch (err) {
      console.error('发送表情包失败:', err)
      alert('发送失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const handleCloseEmoji = () => {
    setShowEmojiPicker(false)
  }

  return (
    <div className="message-input-container">
      {showEmojiPicker && (
        <EmojiPicker 
          onEmojiSelect={handleEmojiSelect}
          onClose={handleCloseEmoji}
        />
      )}

      <div className="message-input-wrapper">
        <button 
          className="emoji-btn"
          onClick={openEmojiPicker}
          disabled={uploading}
        >
          <span>😊</span>
        </button>

        <button 
          className="attach-btn"
          onClick={() => setShowPanel(!showPanel)}
          disabled={uploading}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="5" r="2" fill="currentColor"/>
            <circle cx="12" cy="19" r="2" fill="currentColor"/>
          </svg>
        </button>
        
        {showPanel && (
          <div className="attach-panel">
            <button className="attach-option" onClick={openAttachmentPicker}>
              <span className="emoji">📎</span>
              <span>附件</span>
            </button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div className="input-box">
          <textarea
            className="message-input"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder="发消息..."
            rows="1"
            disabled={uploading}
          />
        </div>

        <button 
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!message.trim() || uploading}
        >
          {uploading ? (
            <span className="loading-spinner"></span>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
            </svg>
          )}
        </button>
      </div>

      {uploading && (
        <div className="uploading-status">
          <span className="loading-spinner"></span>
          上传中...
        </div>
      )}
    </div>
  )
}
