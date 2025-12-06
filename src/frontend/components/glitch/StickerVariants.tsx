import { useState, useEffect } from 'react'
import { StickerService } from '../../services/StickerService'
import '../../styles/StickerVariants.css'

interface StickerVariantsProps {
  imageUrl: string
  spiritId: string
}

interface VariantData {
  id: number
  url: string
  label: string
  filter: string
}

/**
 * StickerVariants Component
 * Generates and displays 4 different sticker variants with visual effects
 */
export const StickerVariants = ({ imageUrl, spiritId }: StickerVariantsProps) => {
  const [variants, setVariants] = useState<VariantData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generate_variants()
  }, [imageUrl, spiritId])

  const generate_variants = async () => {
    setLoading(true)
    try {
      const positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
      ]

      const generated_variants: VariantData[] = []

      for (let i = 0; i < positions.length; i++) {
        try {
          const variant_url = await StickerService.apply_sticker_to_image(
            imageUrl,
            spiritId,
            positions[i]
          )

          generated_variants.push({
            id: i,
            url: variant_url,
            label: `Variant ${i + 1}`,
            filter: get_filter_for_variant(i),
          })
        } catch (error) {
          console.warn(`Failed to generate variant ${i}:`, error)
        }
      }

      setVariants(generated_variants)
    } catch (error) {
      console.error('Failed to generate variants:', error)
    } finally {
      setLoading(false)
    }
  }

  const get_filter_for_variant = (index: number): string => {
    switch (index) {
      case 0:
        return 'grayscale(1) contrast(1.3) brightness(0.9)'
      case 1:
        return 'brightness(0.7) contrast(1.4) saturate(0.5)'
      case 2:
        return 'brightness(1.3) contrast(1.1) saturate(0.8)'
      case 3:
        return 'brightness(1.1) contrast(1.15) saturate(1.2)'
      default:
        return 'brightness(1) contrast(1)'
    }
  }

  return (
    <div className="sticker-variants-container">
      <h3 className="variants-title">Your Cursed Stickers</h3>

      {loading ? (
        <div className="variants-loading">
          <div className="loading-spinner"></div>
          <p>Generating sticker variants...</p>
        </div>
      ) : (
        <div className="stickers-grid">
          {variants.map(variant => {
            const variant_names = ['B&W', 'Dark', 'Light', 'Normal']
            return (
              <div key={variant.id} className="sticker-variant">
                <img
                  src={variant.url}
                  alt={variant_names[variant.id]}
                  className="variant-image"
                  style={{ filter: variant.filter }}
                />
                <span className="variant-label">{variant_names[variant.id]}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StickerVariants
