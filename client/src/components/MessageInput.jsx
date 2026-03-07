import { useState, useRef } from 'react'
import axios from 'axios'

export default function MessageInput({ token, coupleId, onSendMessage, onTyping }) {
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const handleTyping = () => {
    onTyping?.(true)
    
    // 清除之前的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // 2 秒后停止输入状态
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

    // 验证文件类型
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    
    if (!isImage && !isVideo) {
      alert('请选择图片或视频文件')
      return
    }

    // 验证文件大小（20MB）
    if (file.size > 20 * 1024 * 1024) {
      alert('文件大小不能超过 20MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = isVideo ? '/api/upload/video' : '/api/upload/image'
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        await onSendMessage({
          content: '',
          type: response.data.type,
          mediaUrl: response.data.url,
          mediaType: response.data.mimeType
        })
      }
    } catch (err) {
      console.error('上传失败:', err)
      alert('上传失败：' + (err.response?.data?.error || '请稍后重试'))
    } finally {
      setUploading(false)
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <button 
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="发送图片或视频"
        >
          {uploading ? '📤' : '📎'}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <textarea
          className="message-input"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            handleTyping()
          }}
          onKeyPress={handleKeyPress}
          placeholder="输入消息..."
          rows="1"
          disabled={uploading}
        />

        <button 
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!message.trim() || uploading}
        >
          {uploading ? '⏳' : '📤'}
        </button>
      </div>

      {uploading && (
        <div className="uploading-status">
          <span className="loading"></span>
          上传中...
        </div>
      )}
    </div>
  )
}
