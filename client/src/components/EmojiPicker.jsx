import { useState } from 'react'
import './EmojiPicker.css'

// 萨摩耶表情包集合
const SAMOYED_EMOJIS = [
  // 基础表情
  { id: 1, name: '开心', url: 'https://picsum.photos/seed/samoyed1/150/150', category: '基础' },
  { id: 2, name: '撒娇', url: 'https://picsum.photos/seed/samoyed2/150/150', category: '基础' },
  { id: 3, name: '困困', url: 'https://picsum.photos/seed/samoyed3/150/150', category: '基础' },
  { id: 4, name: '生气', url: 'https://picsum.photos/seed/samoyed4/150/150', category: '基础' },
  { id: 5, name: '惊讶', url: 'https://picsum.photos/seed/samoyed5/150/150', category: '基础' },
  { id: 6, name: '害羞', url: 'https://picsum.photos/seed/samoyed6/150/150', category: '基础' },
  
  // 日常表情
  { id: 7, name: '早安', url: 'https://picsum.photos/seed/samoyed7/150/150', category: '日常' },
  { id: 8, name: '晚安', url: 'https://picsum.photos/seed/samoyed8/150/150', category: '日常' },
  { id: 9, name: '吃饭', url: 'https://picsum.photos/seed/samoyed9/150/150', category: '日常' },
  { id: 10, name: '工作', url: 'https://picsum.photos/seed/samoyed10/150/150', category: '日常' },
  { id: 11, name: '休息', url: 'https://picsum.photos/seed/samoyed11/150/150', category: '日常' },
  { id: 12, name: '运动', url: 'https://picsum.photos/seed/samoyed12/150/150', category: '日常' },
  
  // 情感表达
  { id: 13, name: '爱你', url: 'https://picsum.photos/seed/samoyed13/150/150', category: '情感' },
  { id: 14, name: '想你', url: 'https://picsum.photos/seed/samoyed14/150/150', category: '情感' },
  { id: 15, name: '抱抱', url: 'https://picsum.photos/seed/samoyed15/150/150', category: '情感' },
  { id: 16, name: '亲亲', url: 'https://picsum.photos/seed/samoyed16/150/150', category: '情感' },
  { id: 17, name: '感谢', url: 'https://picsum.photos/seed/samoyed17/150/150', category: '情感' },
  { id: 18, name: '对不起', url: 'https://picsum.photos/seed/samoyed18/150/150', category: '情感' },
  
  // 搞笑表情
  { id: 19, name: '吃瓜', url: 'https://picsum.photos/seed/samoyed19/150/150', category: '搞笑' },
  { id: 20, name: '狗头', url: 'https://picsum.photos/seed/samoyed20/150/150', category: '搞笑' },
  { id: 21, name: '无语', url: 'https://picsum.photos/seed/samoyed21/150/150', category: '搞笑' },
  { id: 22, name: '得意', url: 'https://picsum.photos/seed/samoyed22/150/150', category: '搞笑' },
  { id: 23, name: '懵逼', url: 'https://picsum.photos/seed/samoyed23/150/150', category: '搞笑' },
  { id: 24, name: '溜了', url: 'https://picsum.photos/seed/samoyed24/150/150', category: '搞笑' },
  
  // 节日祝福
  { id: 25, name: '新年快乐', url: 'https://picsum.photos/seed/samoyed25/150/150', category: '节日' },
  { id: 26, name: '情人节快乐', url: 'https://picsum.photos/seed/samoyed26/150/150', category: '节日' },
  { id: 27, name: '生日快乐', url: 'https://picsum.photos/seed/samoyed27/150/150', category: '节日' },
  { id: 28, name: '圣诞快乐', url: 'https://picsum.photos/seed/samoyed28/150/150', category: '节日' },
  
  // 情侣互动
  { id: 29, name: '贴贴', url: 'https://picsum.photos/seed/samoyed29/150/150', category: '情侣' },
  { id: 30, name: '牵手', url: 'https://picsum.photos/seed/samoyed30/150/150', category: '情侣' },
  { id: 31, name: '比心', url: 'https://picsum.photos/seed/samoyed31/150/150', category: '情侣' },
  { id: 32, name: '举高高', url: 'https://picsum.photos/seed/samoyed32/150/150', category: '情侣' },
]

const CATEGORIES = ['全部', '基础', '日常', '情感', '搞笑', '节日', '情侣']

export default function EmojiPicker({ onEmojiSelect, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEmojis = SAMOYED_EMOJIS.filter(emoji => {
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
            <img 
              src={emoji.url} 
              alt={emoji.name}
              loading="lazy"
            />
            <span className="emoji-name">{emoji.name}</span>
          </div>
        ))}
      </div>

      {filteredEmojis.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🐕</div>
          <p>没有找到相关表情包</p>
        </div>
      )}

      <div className="emoji-footer">
        <span className="emoji-count">共 {SAMOYED_EMOJIS.length} 个表情包</span>
      </div>
    </div>
  )
}
