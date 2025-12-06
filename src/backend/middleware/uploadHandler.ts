import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { HauntError } from './errorHandler.js'

// Export HauntError for tests
export { HauntError }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * File Upload Configuration
 * Handles image uploads for costume generation
 */

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Storage configuration
const storage = multer.memoryStorage()

/**
 * File filter for image uploads
 */
const file_filter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new HauntError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        'INVALID_FILE_TYPE'
      )
    )
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new HauntError(
        400,
        `Invalid file extension: ${ext}. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
        'INVALID_FILE_EXTENSION'
      )
    )
  }

  cb(null, true)
}

/**
 * Multer upload middleware
 */
export const upload_handler = multer({
  storage,
  fileFilter: file_filter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
})

/**
 * Validate uploaded file
 */
export const validate_uploaded_file = (file: Express.Multer.File | undefined): void => {
  if (!file) {
    throw new HauntError(400, 'No file uploaded', 'NO_FILE_UPLOADED')
  }

  if (file.size === 0) {
    throw new HauntError(400, 'File is empty', 'EMPTY_FILE')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new HauntError(413, 'File too large', 'FILE_TOO_LARGE')
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new HauntError(400, `Invalid file type: ${file.mimetype}`, 'INVALID_FILE_TYPE')
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new HauntError(400, `Invalid file extension: ${ext}`, 'INVALID_FILE_EXTENSION')
  }
}

/**
 * Get file info
 */
export const get_file_info = (file: Express.Multer.File) => {
  return {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    encoding: file.encoding,
  }
}
