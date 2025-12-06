import { describe, it, expect, beforeEach } from 'vitest'
import { validate_uploaded_file, HauntError } from '../../middleware/uploadHandler.js'

describe('Haunt Routes - Upload Validation', () => {
  describe('Image Upload Validation', () => {
    it('should reject files without MIME type', () => {
      const invalid_file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(invalid_file)).toThrow()
    })

    it('should accept JPEG files', () => {
      const valid_file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 500 * 1024, // 500KB
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(valid_file)).not.toThrow()
    })

    it('should accept PNG files', () => {
      const valid_file = {
        originalname: 'photo.png',
        mimetype: 'image/png',
        size: 500 * 1024,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(valid_file)).not.toThrow()
    })

    it('should accept WebP files', () => {
      const valid_file = {
        originalname: 'photo.webp',
        mimetype: 'image/webp',
        size: 500 * 1024,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(valid_file)).not.toThrow()
    })

    it('should reject files larger than 10MB', () => {
      const large_file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(large_file)).toThrow()
    })

    it('should reject empty files', () => {
      const empty_file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 0,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(empty_file)).toThrow()
    })

    it('should reject files with wrong extension', () => {
      const wrong_ext_file = {
        originalname: 'photo.exe',
        mimetype: 'image/jpeg',
        size: 500 * 1024,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(wrong_ext_file)).toThrow()
    })

    it('should accept files at maximum size (10MB)', () => {
      const max_file = {
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // Exactly 10MB
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(max_file)).not.toThrow()
    })

    it('should accept files with various valid sizes', () => {
      const sizes = [1024, 100 * 1024, 500 * 1024, 1024 * 1024, 5 * 1024 * 1024]

      sizes.forEach(size => {
        const file = {
          originalname: 'photo.jpg',
          mimetype: 'image/jpeg',
          size,
          encoding: '7bit',
          fieldname: 'image',
          destination: '',
          filename: '',
          path: '',
          buffer: Buffer.alloc(0),
        } as Express.Multer.File

        expect(() => validate_uploaded_file(file)).not.toThrow()
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw HauntError for invalid files', () => {
      const invalid_file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      try {
        validate_uploaded_file(invalid_file)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(HauntError)
      }
    })

    it('should provide meaningful error messages', () => {
      const invalid_file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        encoding: '7bit',
        fieldname: 'image',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      try {
        validate_uploaded_file(invalid_file)
      } catch (error: any) {
        expect(error.message).toContain('Invalid file type')
      }
    })
  })
})
