/**
 * StickerService
 * Manages spirit stickers and overlays for uploaded images
 */

export interface SpiritSticker {
  spiritId: string
  emoji: string
  label: string
  description: string
  variants?: string[]
}

export interface StickerOverlay {
  emoji: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  size: number // 0.1 to 0.3 (percentage of image)
}

export const SPIRIT_STICKERS: Record<string, SpiritSticker> = {
  ghost: {
    spiritId: 'ghost',
    emoji: '👻',
    label: 'Phantom',
    description: 'A mournful spirit that haunts the living',
    variants: ['👻', '🫂', '💨'],
  },
  vampire: {
    spiritId: 'vampire',
    emoji: '🧛',
    label: 'Nosferatu',
    description: 'An ancient bloodsucker with hypnotic powers',
    variants: ['🧛', '🧛‍♂️', '🧛‍♀️'],
  },
  witch: {
    spiritId: 'witch',
    emoji: '🧙',
    label: 'Enchantress',
    description: 'A mystical sorceress brewing dark magic',
    variants: ['🧙', '🧙‍♀️', '🧙‍♂️'],
  },
  pumpkin_demon: {
    spiritId: 'pumpkin_demon',
    emoji: '🎃',
    label: "Jack O'Malice",
    description: 'A mischievous pumpkin demon from the harvest realm',
    variants: ['🎃', '🔱', '👹'],
  },
}

export const SPIRIT_OVERLAYS: Record<string, StickerOverlay[]> = {
  ghost: [
    { emoji: '✨', position: 'bottom-left', size: 0.15 },
    { emoji: '🌙', position: 'top-left', size: 0.12 },
    { emoji: '💫', position: 'bottom-right', size: 0.13 },
  ],
  vampire: [
    { emoji: '🩸', position: 'bottom-right', size: 0.15 },
    { emoji: '🦇', position: 'top-left', size: 0.12 },
    { emoji: '🌑', position: 'top-right', size: 0.13 },
  ],
  witch: [
    { emoji: '🔮', position: 'bottom-left', size: 0.15 },
    { emoji: '⭐', position: 'top-left', size: 0.12 },
    { emoji: '🌙', position: 'bottom-right', size: 0.13 },
  ],
  pumpkin_demon: [
    { emoji: '🔥', position: 'bottom-right', size: 0.15 },
    { emoji: '🌽', position: 'top-left', size: 0.12 },
    { emoji: '🍂', position: 'bottom-left', size: 0.13 },
  ],
}

export class StickerService {
  /**
   * Get sticker for spirit
   */
  static get_spirit_sticker(spiritId: string): SpiritSticker | null {
    return SPIRIT_STICKERS[spiritId] || null
  }

  /**
   * Create canvas with multiple sticker overlays
   */
  static async apply_sticker_to_image(
    imageData: string,
    spiritId: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' = 'top-right'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext('2d', { alpha: true })
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Enable high-quality rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw original image
          ctx.drawImage(img, 0, 0)

          // Get sticker
          const sticker = this.get_spirit_sticker(spiritId)
          if (!sticker) {
            reject(new Error(`Sticker not found for spirit: ${spiritId}`))
            return
          }

          // Draw main sticker overlay with enhanced quality
          this.draw_sticker_overlay(ctx, canvas.width, canvas.height, sticker, position)

          // Draw additional spirit overlays
          const overlays = SPIRIT_OVERLAYS[spiritId] || []
          overlays.forEach((overlay) => {
            this.draw_emoji_overlay(ctx, canvas.width, canvas.height, overlay)
          })

          // Convert to high-quality PNG
          const result = canvas.toDataURL('image/png', 1.0)
          resolve(result)
        }

        img.onerror = () => {
          reject(new Error('Failed to load image'))
        }

        img.src = imageData
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate multiple sticker variants for a spirit
   */
  static async generate_sticker_variants(
    imageData: string,
    spiritId: string
  ): Promise<string[]> {
    const sticker = this.get_spirit_sticker(spiritId)
    if (!sticker || !sticker.variants) {
      return []
    }

    const variants: string[] = []
    const positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
      'top-right',
      'top-left',
      'bottom-right',
      'bottom-left',
    ]

    for (let i = 0; i < Math.min(sticker.variants.length, positions.length); i++) {
      try {
        const variant = await this.apply_sticker_to_image(imageData, spiritId, positions[i])
        variants.push(variant)
      } catch (error) {
        console.warn(`Failed to generate variant ${i}:`, error)
      }
    }

    return variants
  }

  /**
   * Draw main sticker overlay on canvas with enhanced quality
   */
  private static draw_sticker_overlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    sticker: SpiritSticker,
    position: string
  ): void {
    const sticker_size = Math.min(width, height) * 0.35
    const padding = 15
    const center_x = sticker_size / 2
    const center_y = sticker_size / 2

    let x = 0
    let y = 0

    // Calculate position
    switch (position) {
      case 'top-left':
        x = padding
        y = padding
        break
      case 'top-right':
        x = width - sticker_size - padding
        y = padding
        break
      case 'bottom-left':
        x = padding
        y = height - sticker_size - padding
        break
      case 'bottom-right':
        x = width - sticker_size - padding
        y = height - sticker_size - padding
        break
      case 'center':
        x = (width - sticker_size) / 2
        y = (height - sticker_size) / 2
        break
    }

    // Draw outer glow effect (larger)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)'
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, sticker_size / 2 + 12, 0, Math.PI * 2)
    ctx.fill()

    // Draw semi-transparent background circle with gradient
    const gradient = ctx.createRadialGradient(
      x + center_x,
      y + center_y,
      0,
      x + center_x,
      y + center_y,
      sticker_size / 2
    )
    gradient.addColorStop(0, 'rgba(100, 50, 150, 0.95)')
    gradient.addColorStop(0.7, 'rgba(50, 30, 100, 0.9)')
    gradient.addColorStop(1, 'rgba(20, 10, 40, 0.85)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, sticker_size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw inner border (light)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, sticker_size / 2 - 3, 0, Math.PI * 2)
    ctx.stroke()

    // Draw outer border (gold) - thicker
    ctx.strokeStyle = 'rgba(255, 215, 0, 1)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, sticker_size / 2, 0, Math.PI * 2)
    ctx.stroke()

    // Draw emoji with multiple shadows for depth
    ctx.font = `bold ${sticker_size * 0.7}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Shadow layer 1
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillText(sticker.emoji, x + center_x + 3, y + center_y + 3)

    // Shadow layer 2
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillText(sticker.emoji, x + center_x + 1, y + center_y + 1)

    // Main emoji
    ctx.fillStyle = '#fff'
    ctx.fillText(sticker.emoji, x + center_x, y + center_y)

    // Emoji glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 2
    ctx.strokeText(sticker.emoji, x + center_x, y + center_y)

    // Draw label with shadow
    ctx.font = `bold ${sticker_size * 0.25}px Arial`
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillText(sticker.label, x + center_x + 1, y + center_y + sticker_size * 0.38)

    ctx.fillStyle = '#ffd700'
    ctx.fillText(sticker.label, x + center_x, y + center_y + sticker_size * 0.37)
  }

  /**
   * Draw emoji overlay on canvas with enhanced quality
   */
  private static draw_emoji_overlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    overlay: StickerOverlay
  ): void {
    const emoji_size = Math.min(width, height) * (overlay.size * 1.3)
    const padding = 12
    const center_x = emoji_size / 2
    const center_y = emoji_size / 2

    let x = 0
    let y = 0

    // Calculate position
    switch (overlay.position) {
      case 'top-left':
        x = padding
        y = padding
        break
      case 'top-right':
        x = width - emoji_size - padding
        y = padding
        break
      case 'bottom-left':
        x = padding
        y = height - emoji_size - padding
        break
      case 'bottom-right':
        x = width - emoji_size - padding
        y = height - emoji_size - padding
        break
      case 'center':
        x = (width - emoji_size) / 2
        y = (height - emoji_size) / 2
        break
    }

    // Draw outer glow (larger)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, emoji_size / 2 + 8, 0, Math.PI * 2)
    ctx.fill()

    // Draw semi-transparent background circle with gradient
    const gradient = ctx.createRadialGradient(
      x + center_x,
      y + center_y,
      0,
      x + center_x,
      y + center_y,
      emoji_size / 2
    )
    gradient.addColorStop(0, 'rgba(80, 40, 120, 0.9)')
    gradient.addColorStop(0.7, 'rgba(40, 20, 80, 0.85)')
    gradient.addColorStop(1, 'rgba(10, 5, 30, 0.8)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, emoji_size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw inner border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, emoji_size / 2 - 2, 0, Math.PI * 2)
    ctx.stroke()

    // Draw outer border (gold)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x + center_x, y + center_y, emoji_size / 2, 0, Math.PI * 2)
    ctx.stroke()

    // Draw emoji with shadow
    ctx.font = `bold ${emoji_size * 0.8}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Shadow layer 1
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillText(overlay.emoji, x + center_x + 2, y + center_y + 2)

    // Shadow layer 2
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillText(overlay.emoji, x + center_x + 1, y + center_y + 1)

    // Main emoji
    ctx.fillStyle = '#fff'
    ctx.fillText(overlay.emoji, x + center_x, y + center_y)

    // Emoji glow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1.5
    ctx.strokeText(overlay.emoji, x + center_x, y + center_y)
  }

  /**
   * Get all available stickers
   */
  static get_all_stickers(): SpiritSticker[] {
    return Object.values(SPIRIT_STICKERS)
  }
}
