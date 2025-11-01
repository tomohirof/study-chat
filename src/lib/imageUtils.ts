/**
 * 画像ファイルをBase64エンコードされたData URLに変換
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file as string'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 画像ファイルの検証
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // ファイルサイズチェック（20MB制限）
  const MAX_SIZE = 20 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'ファイルサイズは20MB以下にしてください' }
  }

  // MIMEタイプチェック
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'JPEG, PNG, GIF, WebP形式の画像のみ対応しています' }
  }

  return { valid: true }
}
