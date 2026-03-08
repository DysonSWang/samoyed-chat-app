import { useState, useEffect } from 'react'
import './ImagePreview.css'

export default function ImagePreview({ src, type, onClose }) {
  const [showMenu, setShowMenu] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleLongPressStart = (e) => {
    e.preventDefault()
    const timer = setTimeout(() => {
      const rect = e.target.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      })
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

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `image_${Date.now()}.${type.includes('video') ? 'mp4' : 'jpg'}`
      link.click()
      window.URL.revokeObjectURL(url)
      setShowMenu(false)
    } catch (err) {
      console.error('下载失败:', err)
      alert('下载失败，请重试')
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'image.jpg', { type: 'image/jpeg' })] })) {
        await navigator.share({
          files: [new File([blob], 'image.jpg', { type: 'image/jpeg' })]
        })
      } else {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `image_${Date.now()}.jpg`
        link.click()
        window.URL.revokeObjectURL(url)
      }
      setShowMenu(false)
    } catch (err) {
      console.error('保存失败:', err)
    }
  }

  useEffect(() => {
    const handleClick = () => {
      if (showMenu) setShowMenu(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showMenu])

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
        {type === 'video' ? (
          <video src={src} controls autoPlay loop />
        ) : (
          <img 
            src={src} 
            alt="预览" 
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
          />
        )}
        
        {showMenu && (
          <div 
            className="preview-menu"
            style={{ 
              left: position.x, 
              top: position.y 
            }}
          >
            <button onClick={handleSave}>
              <span>💾</span> 保存图片
            </button>
            <button onClick={handleDownload}>
              <span>⬇️</span> 下载图片
            </button>
          </div>
        )}
      </div>
      
      <button className="preview-close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}
