import { useState } from 'react'
import './EmojiPicker.css'

// 微信经典表情包集合
const WECHAT_EMOJIS = [
  // 经典表情
  { id: 1, name: '微笑', emoji: '🙂', category: '微信经典' },
  { id: 2, name: '撇嘴', emoji: '😦', category: '微信经典' },
  { id: 3, name: '色', emoji: '😍', category: '微信经典' },
  { id: 4, name: '发呆', emoji: '😳', category: '微信经典' },
  { id: 5, name: '得意', emoji: '😏', category: '微信经典' },
  { id: 6, name: '流泪', emoji: '😢', category: '微信经典' },
  { id: 7, name: '害羞', emoji: '😊', category: '微信经典' },
  { id: 8, name: '闭嘴', emoji: '😶', category: '微信经典' },
  { id: 9, name: '睡', emoji: '😴', category: '微信经典' },
  { id: 10, name: '大哭', emoji: '😭', category: '微信经典' },
  { id: 11, name: '尴尬', emoji: '😅', category: '微信经典' },
  { id: 12, name: '发怒', emoji: '😠', category: '微信经典' },
  { id: 13, name: '调皮', emoji: '😜', category: '微信经典' },
  { id: 14, name: '呲牙', emoji: '😁', category: '微信经典' },
  { id: 15, name: '惊讶', emoji: '😲', category: '微信经典' },
  { id: 16, name: '难过', emoji: '😔', category: '微信经典' },
  { id: 17, name: '酷', emoji: '😎', category: '微信经典' },
  { id: 18, name: '冷汗', emoji: '😓', category: '微信经典' },
  { id: 19, name: '抓狂', emoji: '😫', category: '微信经典' },
  { id: 20, name: '吐', emoji: '🤮', category: '微信经典' },
  { id: 21, name: '偷笑', emoji: '🤭', category: '微信经典' },
  { id: 22, name: '可爱', emoji: '🥰', category: '微信经典' },
  { id: 23, name: '白眼', emoji: '🙄', category: '微信经典' },
  { id: 24, name: '傲慢', emoji: '😒', category: '微信经典' },
  { id: 25, name: '饥饿', emoji: '😋', category: '微信经典' },
  { id: 26, name: '困', emoji: '🥱', category: '微信经典' },
  { id: 27, name: '惊恐', emoji: '😱', category: '微信经典' },
  { id: 28, name: '流汗', emoji: '💦', category: '微信经典' },
  { id: 29, name: '憨笑', emoji: '😄', category: '微信经典' },
  { id: 30, name: '悠闲', emoji: '😌', category: '微信经典' },
  { id: 31, name: '奋斗', emoji: '💪', category: '微信经典' },
  { id: 32, name: '咒骂', emoji: '🤬', category: '微信经典' },
  { id: 33, name: '疑问', emoji: '🤔', category: '微信经典' },
  { id: 34, name: '嘘', emoji: '🤫', category: '微信经典' },
  { id: 35, name: '晕', emoji: '😵', category: '微信经典' },
  { id: 36, name: '衰', emoji: '😞', category: '微信经典' },
  { id: 37, name: '骷髅', emoji: '💀', category: '微信经典' },
  { id: 38, name: '敲打', emoji: '👊', category: '微信经典' },
  { id: 39, name: '再见', emoji: '👋', category: '微信经典' },
  { id: 40, name: '擦汗', emoji: '😰', category: '微信经典' },
  { id: 41, name: '抠鼻', emoji: '🤏', category: '微信经典' },
  { id: 42, name: '鼓掌', emoji: '👏', category: '微信经典' },
  { id: 43, name: '坏笑', emoji: '😈', category: '微信经典' },
  { id: 44, name: '左哼哼', emoji: '😤', category: '微信经典' },
  { id: 45, name: '右哼哼', emoji: '😤', category: '微信经典' },
  { id: 46, name: '哈欠', emoji: '🥱', category: '微信经典' },
  { id: 47, name: '鄙视', emoji: '🙄', category: '微信经典' },
  { id: 48, name: '委屈', emoji: '😢', category: '微信经典' },
  { id: 49, name: '快哭了', emoji: '😭', category: '微信经典' },
  { id: 50, name: '阴险', emoji: '😏', category: '微信经典' },
  { id: 51, name: '亲亲', emoji: '😘', category: '微信经典' },
  { id: 52, name: '吓', emoji: '😨', category: '微信经典' },
  { id: 53, name: '可怜', emoji: '🥺', category: '微信经典' },
  { id: 54, name: '强', emoji: '👍', category: '微信经典' },
  { id: 55, name: '弱', emoji: '👎', category: '微信经典' },
  { id: 56, name: '握手', emoji: '🤝', category: '微信经典' },
  { id: 57, name: '胜利', emoji: '✌️', category: '微信经典' },
  { id: 58, name: '抱拳', emoji: '🙏', category: '微信经典' },
  { id: 59, name: '勾引', emoji: '🤟', category: '微信经典' },
  { id: 60, name: '拳头', emoji: '👊', category: '微信经典' },
  { id: 61, name: 'OK', emoji: '👌', category: '微信经典' },
  { id: 62, name: '爱你', emoji: '❤️', category: '微信经典' },
  { id: 63, name: '飞吻', emoji: '😙', category: '微信经典' },
  { id: 64, name: '玫瑰', emoji: '🌹', category: '微信经典' },
  { id: 65, name: '凋谢', emoji: '🥀', category: '微信经典' },
  { id: 66, name: '爱心', emoji: '💕', category: '微信经典' },
  { id: 67, name: '心碎', emoji: '💔', category: '微信经典' },
  { id: 68, name: '蛋糕', emoji: '🎂', category: '微信经典' },
  { id: 69, name: '礼物', emoji: '🎁', category: '微信经典' },
  { id: 70, name: '太阳', emoji: '☀️', category: '微信经典' },
  { id: 71, name: '月亮', emoji: '🌙', category: '微信经典' },
  { id: 72, name: '星星', emoji: '⭐', category: '微信经典' },
  { id: 73, name: '闪电', emoji: '⚡', category: '微信经典' },
  { id: 74, name: '炸弹', emoji: '💣', category: '微信经典' },
  { id: 75, name: '刀', emoji: '🔪', category: '微信经典' },
  { id: 76, name: '足球', emoji: '⚽', category: '微信经典' },
  { id: 77, name: '篮球', emoji: '🏀', category: '微信经典' },
  { id: 78, name: '乒乓球', emoji: '🏓', category: '微信经典' },
  { id: 79, name: '咖啡', emoji: '☕', category: '微信经典' },
  { id: 80, name: '啤酒', emoji: '🍺', category: '微信经典' },
  { id: 81, name: '干杯', emoji: '🍻', category: '微信经典' },
  { id: 82, name: '饭', emoji: '🍚', category: '微信经典' },
  { id: 83, name: '猪头', emoji: '🐷', category: '微信经典' },
  { id: 84, name: '狗头', emoji: '🐶', category: '微信经典' },
  { id: 85, name: '猫', emoji: '🐱', category: '微信经典' },
  { id: 86, name: '鸡', emoji: '🐔', category: '微信经典' },
  { id: 87, name: '兔子', emoji: '🐰', category: '微信经典' },
  { id: 88, name: '蜜蜂', emoji: '🐝', category: '微信经典' },
  { id: 89, name: '蝴蝶', emoji: '🦋', category: '微信经典' },
  { id: 90, name: '鱼', emoji: '🐟', category: '微信经典' },
  { id: 91, name: '便便', emoji: '💩', category: '微信经典' },
  { id: 92, name: '火', emoji: '🔥', category: '微信经典' },
  { id: 93, name: '水滴', emoji: '💧', category: '微信经典' },
  { id: 94, name: '药', emoji: '💊', category: '微信经典' },
  { id: 95, name: '钱', emoji: '💰', category: '微信经典' },
  { id: 96, name: '红包', emoji: '🧧', category: '微信经典' },
  { id: 97, name: '烟花', emoji: '🎆', category: '微信经典' },
  { id: 98, name: '鞭炮', emoji: '🧨', category: '微信经典' },
  { id: 99, name: '福', emoji: '🏮', category: '微信经典' },
  { id: 100, name: '发', emoji: '🀄', category: '微信经典' },
]

// 基础表情
const BASIC_EMOJIS = [
  { id: 101, name: '开心', emoji: '😄', category: '基础' },
  { id: 102, name: '大笑', emoji: '😂', category: '基础' },
  { id: 103, name: '微笑', emoji: '😊', category: '基础' },
  { id: 104, name: '生气', emoji: '😠', category: '基础' },
  { id: 105, name: '惊讶', emoji: '😲', category: '基础' },
  { id: 106, name: '害羞', emoji: '😳', category: '基础' },
  { id: 107, name: '难过', emoji: '😢', category: '基础' },
  { id: 108, name: '困', emoji: '😴', category: '基础' },
]

// 日常表情
const DAILY_EMOJIS = [
  { id: 201, name: '早安', emoji: '☀️', category: '日常' },
  { id: 202, name: '晚安', emoji: '🌙', category: '日常' },
  { id: 203, name: '吃饭', emoji: '🍚', category: '日常' },
  { id: 204, name: '咖啡', emoji: '☕', category: '日常' },
  { id: 205, name: '工作', emoji: '💼', category: '日常' },
  { id: 206, name: '休息', emoji: '🛋️', category: '日常' },
]

// 情感表达
const EMOTION_EMOJIS = [
  { id: 301, name: '爱你', emoji: '❤️', category: '情感' },
  { id: 302, name: '想你', emoji: '💭', category: '情感' },
  { id: 303, name: '抱抱', emoji: '🤗', category: '情感' },
  { id: 304, name: '亲亲', emoji: '😘', category: '情感' },
  { id: 305, name: '感谢', emoji: '🙏', category: '情感' },
  { id: 306, name: '对不起', emoji: '😔', category: '情感' },
]

// 情侣互动
const COUPLE_EMOJIS = [
  { id: 401, name: '爱心', emoji: '💕', category: '情侣' },
  { id: 402, name: '玫瑰', emoji: '🌹', category: '情侣' },
  { id: 403, name: '牵手', emoji: '👫', category: '情侣' },
  { id: 404, name: '亲吻', emoji: '💏', category: '情侣' },
  { id: 405, name: '情侣', emoji: '💑', category: '情侣' },
  { id: 406, name: '钻戒', emoji: '💍', category: '情侣' },
  { id: 407, name: '情书', emoji: '💌', category: '情侣' },
  { id: 408, name: '礼物', emoji: '🎁', category: '情侣' },
]

// 搞笑表情
const FUNNY_EMOJIS = [
  { id: 501, name: '吃瓜', emoji: '🍉', category: '搞笑' },
  { id: 502, name: '狗头', emoji: '🐶', category: '搞笑' },
  { id: 503, name: '无语', emoji: '😑', category: '搞笑' },
  { id: 504, name: '得意', emoji: '😏', category: '搞笑' },
  { id: 505, name: '懵逼', emoji: '😵', category: '搞笑' },
  { id: 506, name: '溜了', emoji: '🏃', category: '搞笑' },
  { id: 507, name: '墨镜', emoji: '🕶️', category: '搞笑' },
  { id: 508, name: '小丑', emoji: '🤡', category: '搞笑' },
]

// 节日祝福
const FESTIVAL_EMOJIS = [
  { id: 601, name: '新年快乐', emoji: '🎉', category: '节日' },
  { id: 602, name: '生日快乐', emoji: '🎂', category: '节日' },
  { id: 603, name: '礼物', emoji: '🎁', category: '节日' },
  { id: 604, name: '圣诞', emoji: '🎄', category: '节日' },
  { id: 605, name: '红包', emoji: '🧧', category: '节日' },
  { id: 606, name: '灯笼', emoji: '🏮', category: '节日' },
  { id: 607, name: '烟花', emoji: '🎆', category: '节日' },
  { id: 608, name: '鞭炮', emoji: '🧨', category: '节日' },
]

// 合并所有表情包
const ALL_EMOJIS = [
  ...WECHAT_EMOJIS,
  ...BASIC_EMOJIS,
  ...DAILY_EMOJIS,
  ...EMOTION_EMOJIS,
  ...COUPLE_EMOJIS,
  ...FUNNY_EMOJIS,
  ...FESTIVAL_EMOJIS,
]

const CATEGORIES = ['全部', '微信经典', '基础', '日常', '情感', '情侣', '搞笑', '节日']

export default function EmojiPicker({ onEmojiSelect, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEmojis = ALL_EMOJIS.filter(emoji => {
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
        <span className="emoji-count">共 {ALL_EMOJIS.length} 个表情</span>
      </div>
    </div>
  )
}
