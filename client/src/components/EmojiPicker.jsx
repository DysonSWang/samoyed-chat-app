import { useState } from 'react'
import './EmojiPicker.css'

// 经典表情包集合（使用 emoji）
const CLASSIC_EMOJIS = [
  // 基础表情
  { id: 1, name: '开心', emoji: '😄', category: '基础' },
  { id: 2, name: '大笑', emoji: '😂', category: '基础' },
  { id: 3, name: '微笑', emoji: '😊', category: '基础' },
  { id: 4, name: '生气', emoji: '😠', category: '基础' },
  { id: 5, name: '惊讶', emoji: '😲', category: '基础' },
  { id: 6, name: '害羞', emoji: '😳', category: '基础' },
  { id: 7, name: '难过', emoji: '😢', category: '基础' },
  { id: 8, name: '困', emoji: '😴', category: '基础' },
  
  // 日常表情
  { id: 9, name: '早安', emoji: '☀️', category: '日常' },
  { id: 10, name: '晚安', emoji: '🌙', category: '日常' },
  { id: 11, name: '吃饭', emoji: '🍚', category: '日常' },
  { id: 12, name: '咖啡', emoji: '☕', category: '日常' },
  { id: 13, name: '工作', emoji: '💼', category: '日常' },
  { id: 14, name: '休息', emoji: '🛋️', category: '日常' },
  
  // 情感表达
  { id: 15, name: '爱你', emoji: '❤️', category: '情感' },
  { id: 16, name: '想你', emoji: '💭', category: '情感' },
  { id: 17, name: '抱抱', emoji: '🤗', category: '情感' },
  { id: 18, name: '亲亲', emoji: '😘', category: '情感' },
  { id: 19, name: '感谢', emoji: '🙏', category: '情感' },
  { id: 20, name: '对不起', emoji: '😔', category: '情感' },
  
  // 搞笑表情
  { id: 21, name: '吃瓜', emoji: '🍉', category: '搞笑' },
  { id: 22, name: '狗头', emoji: '🐶', category: '搞笑' },
  { id: 23, name: '无语', emoji: '😑', category: '搞笑' },
  { id: 24, name: '得意', emoji: '😏', category: '搞笑' },
  { id: 25, name: '懵逼', emoji: '😵', category: '搞笑' },
  { id: 26, name: '溜了', emoji: '🏃', category: '搞笑' },
  
  // 节日祝福
  { id: 27, name: '新年快乐', emoji: '🎉', category: '节日' },
  { id: 28, name: '生日快乐', emoji: '🎂', category: '节日' },
  { id: 29, name: '礼物', emoji: '🎁', category: '节日' },
  
  // 情侣互动
  { id: 30, name: '爱心', emoji: '💕', category: '情侣' },
  { id: 31, name: '玫瑰', emoji: '🌹', category: '情侣' },
  { id: 32, name: '牵手', emoji: '👫', category: '情侣' },
]

const CATEGORIES = ['全部', '基础', '日常', '情感', '搞笑', '节日', '情侣']

export default function EmojiPicker({ onEmojiSelect, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEmojis = CLASSIC_EMOJIS.filter(emoji => {
    const matchCategory = selectedCategory === '全部' || emoji.category === selectedCategory
    const matchSearch = !searchQuery || emoji.name.includes(searchQuery)
    return matchCategory && matchSearch
  })

  const handleEmojiClick = (emoji) => {
    onEmojiSelect?.(emoji)
  }

  return (
    <div className="emoji-picker">
      <div className="emoji-header">
        <div className="emoji-search">
          <input
            type="text"
            placeholder="搜索表情包..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="emoji-categories">
        {CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="emoji-grid">
        {filteredEmojis.map(emoji => (
          <div
            key={emoji.id}
            className="emoji-item"
            onClick={() => handleEmojiClick(emoji)}
            title={emoji.name}
          >
            <span className="emoji-icon">{emoji.emoji}</span>
            <span className="emoji-name">{emoji.name}</span>
          </div>
        ))}
      </div>

      {filteredEmojis.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">😊</div>
          <p>没有找到相关表情包</p>
        </div>
      )}

      <div className="emoji-footer">
        <span className="emoji-count">共 {CLASSIC_EMOJIS.length} 个经典表情</span>
      </div>
    </div>
  )
}
