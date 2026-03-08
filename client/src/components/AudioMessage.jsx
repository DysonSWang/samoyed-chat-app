import { useState, useRef } from 'react'
import './AudioMessage.css'

export default function AudioMessage({ url, duration, isOwn }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(currentProgress)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  const handleProgressClick = (e) => {
    if (!audioRef.current) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    const newTime = clickPosition * audioRef.current.duration
    audioRef.current.currentTime = newTime
    setProgress(clickPosition * 100)
  }

  return (
    <div className={`audio-message ${isOwn ? 'own' : ''}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="audio-content">
        <button 
          className={`play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1"/>
              <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          )}
        </button>

        <div className="audio-info">
          <div 
            className="progress-bar" 
            onClick={handleProgressClick}
          >
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
            <div 
              className="progress-handle"
              style={{ left: `${progress}%` }}
            />
          </div>
          <span className="duration">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}
