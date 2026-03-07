export default function ChatHeader({ user, couple, partnerOnline, onLogout }) {
  // 获取对方信息
  const isUser1 = couple?.user1_id === user?.id
  const partnerUsername = isUser1 ? couple?.user2_username : couple?.user1_username
  const partnerNickname = isUser1 ? couple?.user2_nickname : couple?.user1_nickname

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="partner-avatar">
          🐕
          {partnerOnline && <div className="online-indicator"></div>}
        </div>
        <div className="partner-info">
          <h3>{partnerNickname || partnerUsername}</h3>
          <div className={`partner-status ${partnerOnline ? 'online' : ''}`}>
            {partnerOnline ? '在线' : '离线'}
          </div>
        </div>
      </div>
      
      <button className="logout-btn" onClick={onLogout} title="退出登录">
        🚪
      </button>
    </div>
  )
}
