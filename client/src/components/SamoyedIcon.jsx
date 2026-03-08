// 萨摩耶图标组件 - 使用 SVG 版本
export default function SamoyedIcon({ size = '24', className = '', style = {} }) {
  const sizeMap = {
    'small': '16',
    'medium': '24',
    'large': '48',
    'xlarge': '64',
    'xxlarge': '96'
  }
  
  const actualSize = sizeMap[size] || size
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100"
      width={actualSize}
      height={actualSize}
      className={className}
      style={style}
    >
      {/* 萨摩耶脸部轮廓 */}
      <circle cx="50" cy="50" r="48" fill="#FFB6C1"/>
      <circle cx="50" cy="50" r="42" fill="#FFFFFF"/>
      
      {/* 眼睛 */}
      <ellipse cx="35" cy="42" rx="5" ry="6" fill="#2D3748"/>
      <ellipse cx="65" cy="42" rx="5" ry="6" fill="#2D3748"/>
      <circle cx="37" cy="40" r="2" fill="#FFFFFF"/>
      <circle cx="67" cy="40" r="2" fill="#FFFFFF"/>
      
      {/* 鼻子 */}
      <ellipse cx="50" cy="52" rx="8" ry="6" fill="#FF9EAA"/>
      
      {/* 嘴巴 - 萨摩耶式微笑 */}
      <path d="M 42 62 Q 50 68 58 62" stroke="#2D3748" stroke-width="3" fill="none" stroke-linecap="round"/>
      
      {/* 腮红 */}
      <circle cx="30" cy="55" r="4" fill="#FFB6C1" opacity="0.6"/>
      <circle cx="70" cy="55" r="4" fill="#FFB6C1" opacity="0.6"/>
      
      {/* 耳朵 */}
      <path d="M 20 35 L 15 20 L 30 28 Z" fill="#FFFFFF"/>
      <path d="M 80 35 L 85 20 L 70 28 Z" fill="#FFFFFF"/>
    </svg>
  )
}
