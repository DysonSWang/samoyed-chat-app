# 🎤 语音消息功能

语音消息功能已集成到萨摩耶聊天室！现在可以像微信一样发送语音消息了。

---

## ✨ 功能特性

### 已实现
- ✅ **浏览器原生录音** - 无需额外插件
- ✅ **实时波形动画** - 录音时显示动态效果
- ✅ **录音预览** - 发送前可试听
- ✅ **重录功能** - 不满意可以重新录制
- ✅ **进度条控制** - 播放时可拖动进度
- ✅ **播放/暂停** - 点击控制播放
- ✅ **时长显示** - 显示录音时长
- ✅ **OSS 云存储** - 音频文件存储到阿里云
- ✅ **实时推送** - 对方即时收到语音消息

### 技术细节
- **录音格式**: WebM/OGG (浏览器自动选择)
- **文件大小**: 最大 20MB
- **存储路径**: `samoyed-chat/audios/{uuid}.webm`
- **支持格式**: audio/webm, audio/ogg, audio/mp4, audio/m4a

---

## 🚀 使用指南

### 发送语音消息

1. **点击附件按钮** (⋮)
2. **选择"语音"** (🎤)
3. **开始录音** - 自动开始录制
4. **点击"完成"** - 结束录音
5. **试听** - 可预览录音效果
6. **发送** - 或选择"重录"

### 播放语音消息

- **点击播放按钮** - 开始/暂停播放
- **拖动进度条** - 跳转到指定位置
- **显示时长** - 右侧显示总时长

---

## 📁 新增文件

### 前端组件
```
client/src/components/
├── VoiceRecorder.jsx       # 录音组件
├── VoiceRecorder.css       # 录音样式
├── AudioMessage.jsx        # 音频消息组件
└── AudioMessage.css        # 音频消息样式
```

### 后端接口
```
server/src/routes/upload.js  # 添加了 /audio 接口
```

### 数据库
```sql
-- messages 表新增字段
ALTER TABLE messages ADD COLUMN duration INTEGER;
```

---

## 🔧 API 接口

### 上传音频
```http
POST /api/upload/audio
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: {audio blob}
- duration: {录音时长 (秒)}

Response:
{
  "success": true,
  "url": "https://...",
  "type": "audio",
  "mimeType": "audio/webm",
  "size": 12345,
  "duration": 15
}
```

### 发送消息
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "",
  "type": "audio",
  "mediaUrl": "https://...",
  "mediaType": "audio/webm",
  "duration": 15
}
```

---

## 🎨 UI 设计

### 录音界面
- 粉色渐变主题（萨摩耶配色）
- 脉冲动画提示录音中
- 大按钮易于操作
- 实时计时显示

### 播放界面
- 播放/暂停按钮
- 进度条可拖动
- 时长显示
- 播放时脉冲动画

---

## 🔒 安全特性

- ✅ JWT 认证
- ✅ 文件类型验证
- ✅ 文件大小限制 (20MB)
- ✅ 音频格式白名单
- ✅ 一对一私密聊天

---

## 📱 浏览器兼容性

| 浏览器 | 支持 | 格式 |
|--------|------|------|
| Chrome | ✅ | audio/webm, audio/ogg |
| Firefox | ✅ | audio/webm, audio/ogg |
| Safari | ✅ | audio/mp4, audio/m4a |
| Edge | ✅ | audio/webm, audio/ogg |
| 微信内置 | ✅ | audio/mp4 |

---

## 🐛 常见问题

### Q: 录音没声音？
A: 检查浏览器麦克风权限设置

### Q: 无法上传？
A: 检查网络连接和 OSS 配置

### Q: 播放不了？
A: 确认浏览器支持对应音频格式

### Q: 录音太短？
A: 建议至少录制 1 秒以上

---

## 🎯 后续优化

- [ ] 语音转文字（可选）
- [ ] 变声特效（趣味功能）
- [ ] 语音消息撤回
- [ ] 离线录音
- [ ] 背景降噪
- [ ] 录音质量选择

---

**享受语音聊天的乐趣！🐕💕**
