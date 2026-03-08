import { useState, useRef } from 'react'
import './VoiceRecorder.css'

export default function VoiceRecorder({ onRecordEnd, onCancel }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: chunksRef.current[0]?.type || 'audio/webm' 
        })
        setAudioBlob(blob)
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // 每 100ms 收集一次数据
      setIsRecording(true)
      
      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('录音失败:', err)
      alert('无法访问麦克风，请检查权限设置')
      onCancel?.()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleSend = () => {
    if (audioBlob) {
      onRecordEnd?.(audioBlob, recordingTime)
    }
  }

  const handleCancel = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    onCancel?.()
  }

  const handleRetake = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    startRecording()
  }

  // 自动开始录音
  useState(() => {
    startRecording()
  })

  return (
    <div className="voice-recorder">
      <div className="recorder-content">
        {audioBlob ? (
          // 录音完成，预览
          <div className="preview-mode">
            <div className="audio-wave">
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
              <div className="wave-bar"></div>
            </div>
            <div className="recording-time">{formatTime(recordingTime)}</div>
            <div className="preview-actions">
              <button className="action-btn retake" onClick={handleRetake}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor"/>
                </svg>
                <span>重录</span>
              </button>
              <button className="action-btn send" onClick={handleSend}>
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                </svg>
                <span>发送</span>
              </button>
            </div>
          </div>
        ) : (
          // 录音中
          <div className="recording-mode">
            <div className={`record-button ${isRecording ? 'recording' : ''}`}>
              <div className="record-icon"></div>
            </div>
            <div className="recording-status">
              {isRecording ? '正在录音...' : '已暂停'}
            </div>
            <div className="recording-time">{formatTime(recordingTime)}</div>
            <div className="recording-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                取消
              </button>
              <button 
                className={`stop-btn ${isRecording ? 'active' : ''}`} 
                onClick={isRecording ? stopRecording : undefined}
                disabled={!isRecording}
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
