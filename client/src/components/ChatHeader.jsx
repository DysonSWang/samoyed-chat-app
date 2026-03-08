import SamoyedIcon from './SamoyedIcon'

export default function ChatHeader({ couple, user, partnerOnline, onPoke }) {
  // 根据当前用户 ID，判断对方是谁
  const getPartnerInfo = () => {
    if (!couple) return { nickname: '毛孩子', username: '' }
    
    if (user?.id === couple.user1_id) {
      return {
        nickname: couple.user2_nickname || couple.user2_username || 'TA',
        username: couple.user2_username
      }
    }
    if (user?.id === couple.user2_id) {
      return {
        nickname: couple.user1_nickname || couple.user1_username || 'TA',
        username: couple.user1_username
      }
    }
    return { nickname: '毛孩子', username: '' }
  }

  const partner = getPartnerInfo()

  const handleAvatarClick = () => {
    onPoke?.()
  }

  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div 
          className="partner-avatar poke-target"
          onClick={handleAvatarClick}
          title="戳一戳"
        >
          <SamoyedIcon size="32" />
          {partnerOnline && <div className="online-indicator"></div>}
        </div>
        <div className="partner-info">
          <h3>{partner.nickname}</h3>
          <div className={`partner-status ${partnerOnline ? 'online' : ''}`}>
            {partnerOnline ? '🟢 在线' : '⚫ 离线'}
          </div>
        </div>
      </div>
    </div>
  )
}
