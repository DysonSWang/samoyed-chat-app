/**
 * 图片压缩工具
 * 使用 Canvas 压缩图片，保持质量的同时减小文件大小
 */

// 压缩配置
const COMPRESS_CONFIG = {
  maxWidth: 1920,      // 最大宽度
  maxHeight: 1920,     // 最大高度
  quality: 0.8,        // 压缩质量 (0.7-0.9 最佳)
  maxSize: 500 * 1024, // 最大文件大小 500KB
  mimeType: 'image/jpeg' // 输出格式
}

/**
 * 压缩图片
 * @param {File|Blob} file - 原始图片文件
 * @param {Object} options - 压缩配置
 * @returns {Promise<Blob>} - 压缩后的 Blob
 */
export async function compressImage(file, options = {}) {
  const config = { ...COMPRESS_CONFIG, ...options }
  
  return new Promise((resolve, reject) => {
    // 检查是否为图片
    if (!file.type.startsWith('image/')) {
      reject(new Error('不是图片文件'))
      return
    }
    
    // GIF 不压缩（会损坏动画）
    if (file.type === 'image/gif') {
      resolve(file)
      return
    }
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // 计算压缩后的尺寸
          let width = img.width
          let height = img.height
          
          // 等比例缩放
          if (width > height) {
            if (width > config.maxWidth) {
              height = Math.round(height * config.maxWidth / width)
              width = config.maxWidth
            }
          } else {
            if (height > config.maxHeight) {
              width = Math.round(width * config.maxHeight / height)
              height = config.maxHeight
            }
          }
          
          // 创建 Canvas
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          
          // 绘制图片（带平滑处理）
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
          
          // 压缩并检查大小
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('压缩失败'))
                return
              }
              
              // 如果文件还是太大，递归降低质量
              if (blob.size > config.maxSize && config.quality > 0.5) {
                canvas.toBlob(
                  (smallBlob) => {
                    resolve(smallBlob || blob)
                  },
                  config.mimeType,
                  config.quality * 0.7
                )
              } else {
                resolve(blob)
              }
            },
            config.mimeType,
            config.quality
          )
        } catch (err) {
          reject(err)
        }
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 计算压缩率
 * @param {number} originalSize - 原始大小
 * @param {number} compressedSize - 压缩后大小
 * @returns {string} - 压缩率描述
 */
export function getCompressionRate(originalSize, compressedSize) {
  const rate = ((1 - compressedSize / originalSize) * 100).toFixed(1)
  const originalMB = (originalSize / 1024 / 1024).toFixed(2)
  const compressedKB = (compressedSize / 1024).toFixed(1)
  
  return `-${rate}% (${originalMB}MB → ${compressedKB}KB)`
}

/**
 * 检查是否需要压缩
 * @param {File} file - 图片文件
 * @returns {boolean}
 */
export function needsCompression(file) {
  // 大于 1MB 或尺寸过大时压缩
  return file.size > 1024 * 1024 || 
         file.type === 'image/png' || 
         file.type === 'image/webp'
}

/**
 * 智能压缩（根据文件大小决定是否压缩）
 * @param {File} file - 图片文件
 * @returns {Promise<{blob: Blob, compressed: boolean, rate?: string}>}
 */
export async function smartCompress(file) {
  // 小文件不压缩
  if (file.size < 500 * 1024 && file.type === 'image/jpeg') {
    return {
      blob: file,
      compressed: false,
      rate: '无需压缩'
    }
  }
  
  const originalSize = file.size
  const compressed = await compressImage(file)
  
  return {
    blob: compressed,
    compressed: true,
    rate: getCompressionRate(originalSize, compressed.size)
  }
}

export default {
  compressImage,
  smartCompress,
  needsCompression,
  getCompressionRate,
  COMPRESS_CONFIG
}
