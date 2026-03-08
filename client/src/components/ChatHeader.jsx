export default function ChatHeader({ couple, partnerOnline }) {
  const partnerNickname = couple?.user2_nickname || couple?.user1_nickname || couple?.user2_username || couple?.user1_username

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="partner-avatar">
          🐕
          {partnerOnline && <div className="online-indicator"></div>}
        </div>
        <div className="partner-info">
          <h3>{partnerNickname || '毛孩子'}</h3>
          <div className={`partner-status ${partnerOnline ? 'online' : ''}`}>
            {partnerOnline ? '在线' : '离线'}
          </div>
        </div>
      </div>
    </div>
  )
}
