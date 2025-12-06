import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { StickerService } from '../../services/StickerService'
import '../../styles/PhotoBooth.css'

interface UploadSpiritProps {
  onUpload: (file: File, spiritId: string) => void
  isLoading: boolean
}

interface Spirit {
  id: string
  name: string
  description: string
  color_theme: string
}

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * UploadSpirit Component
 * Allows users to upload a selfie and select a spirit to summon
 * Follows spooky naming convention
 */
export const UploadSpirit = ({ onUpload, isLoading }: UploadSpiritProps) => {
  const [selectedSpirit, setSelectedSpirit] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [previewWithSticker, setPreviewWithSticker] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loadingSpirits, setLoadingSpirits] = useState(true)
  const [applyingSticker, setApplyingSticker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load available spirits on mount
  useEffect(() => {
    const load_spirits = async () => {
      try {
        const response = await axios.get('/api/curse/list')
        if (response.data.success && response.data.data) {
          setSpirits(response.data.data)
        }
      } catch (err) {
        console.error('Failed to load spirits:', err)
        setError('Failed to load spirits. Please refresh the page.')
      } finally {
        setLoadingSpirits(false)
      }
    }

    load_spirits()
  }, [])

  /**
   * Validate file before upload
   */
  const validate_file = (file: File): string | null => {
    if (!file) {
      return 'No file selected'
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      return `Invalid file format. Allowed: JPG, PNG, WebP. Got: ${file.type}`
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max size: 10MB. Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }

    if (file.size === 0) {
      return 'File is empty'
    }

    return null
  }

  /**
   * Handle file selection
   */
  const handle_file_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation_error = validate_file(file)
    if (validation_error) {
      setError(validation_error)
      setSelectedFile(null)
      setPreview('')
      return
    }

    setError('')
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  /**
   * Handle spirit selection
   */
  const handle_spirit_select = async (spiritId: string) => {
    setSelectedSpirit(spiritId)
    setError('')

    // Apply sticker to preview if image exists
    if (preview) {
      setApplyingSticker(true)
      try {
        const stickered = await StickerService.apply_sticker_to_image(preview, spiritId, 'top-right')
        setPreviewWithSticker(stickered)
      } catch (err) {
        console.error('Failed to apply sticker:', err)
        setPreviewWithSticker(preview)
      } finally {
        setApplyingSticker(false)
      }
    }
  }

  /**
   * Handle upload
   */
  const handle_upload = async () => {
    // Validate selections
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    if (!selectedSpirit) {
      setError('Please select a spirit to summon')
      return
    }

    // Validate file again
    const validation_error = validate_file(selectedFile)
    if (validation_error) {
      setError(validation_error)
      return
    }

    try {
      setError('')
      // Upload file to backend
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('spiritId', selectedSpirit)

      const response = await axios.post('/api/haunt/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success && response.data.data?.sessionId) {
        onUpload(selectedFile, selectedSpirit)
      } else {
        setError('Upload failed. Please try again.')
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', err)
    }
  }

  /**
   * Handle file input click
   */
  const handle_file_input_click = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handle drag and drop
   */
  const handle_drag_over = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handle_drag_leave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over')
  }

  const handle_drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')

    const file = e.dataTransfer.files?.[0]
    if (file) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handle_file_change({ target: input } as any)
      }
    }
  }

  if (loadingSpirits) {
    return (
      <div className="possess-upload-container">
        <div className="loading-spinner">Loading spirits...</div>
      </div>
    )
  }

  return (
    <div className="photo-booth-container">
      <div className="booth-content">
        {/* Compact Upload Square */}
        <div
          className="booth-upload-square"
          onDragOver={handle_drag_over}
          onDragLeave={handle_drag_leave}
          onDrop={handle_drop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handle_file_change}
            disabled={isLoading}
            className="file-input"
          />

          {preview ? (
            <div className="booth-preview">
              {applyingSticker && (
                <div className="sticker-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
              <img
                src={previewWithSticker || preview}
                alt="Preview"
                className="booth-preview-image"
              />
              <button
                className="booth-change-btn"
                onClick={handle_file_input_click}
                disabled={isLoading}
              >
                📸
              </button>
            </div>
          ) : (
            <div className="booth-upload-prompt" onClick={handle_file_input_click}>
              <div className="booth-upload-icon">📷</div>
              <p className="booth-upload-text">Click to upload</p>
            </div>
          )}
        </div>

        {/* Spirit Selection - 4 Buttons in a Row */}
        <div className="booth-spirit-buttons">
          {spirits.map((spirit) => (
            <button
              key={spirit.id}
              className={`booth-spirit-btn ${selectedSpirit === spirit.id ? 'selected' : ''}`}
              onClick={() => handle_spirit_select(spirit.id)}
              disabled={isLoading}
              title={spirit.description}
            >
              <span className="booth-spirit-emoji">
                {spirit.id === 'ghost' && '👻'}
                {spirit.id === 'vampire' && '🧛'}
                {spirit.id === 'witch' && '🧙'}
                {spirit.id === 'pumpkin_demon' && '🎃'}
              </span>
              <span className="booth-spirit-name">{spirit.name}</span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="booth-error">
            <span className="booth-error-icon">⚠️</span>
            <span className="booth-error-text">{error}</span>
          </div>
        )}

        {/* Summon Button */}
        <button
          className="booth-summon-btn"
          onClick={handle_upload}
          disabled={!selectedFile || !selectedSpirit || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Summoning...
            </>
          ) : (
            <>
              🎃 SUMMON
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default UploadSpirit
