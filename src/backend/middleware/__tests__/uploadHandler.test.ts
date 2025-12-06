import { describe, it, expect } from 'vitest'
import { validate_uploaded_file, get_file_info, HauntError } from '../uploadHandler.js'

describe('Upload Handler', () => {
  describe('validate_uploaded_file', () => {
    it('should throw error if no file is provided', () => {
      expect(() => validate_uploaded_file(undefined)).toThrow()
    })

    it('should throw error if file is empty', () => {
      const empty_file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 0,
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(empty_file)).toThrow()
    })

    it('should throw error if file is too large', () => {
      const large_file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(large_file)).toThrow()
    })

    it('should throw error if file type is invalid', () => {
      const invalid_file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 1024,
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(invalid_file)).toThrow()
    })

    it('should accept valid JPEG file', () => {
      const valid_file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 100, // 100KB
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(valid_file)).not.toThrow()
    })

    it('should accept valid PNG file', () => {
      const valid_file = {
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1024 * 100,
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(valid_file)).not.toThrow()
    })

    it('should accept valid WebP file', () => {
      const valid_file = {
        originalname: 'test.webp',
        mimetype: 'image/webp',
        size: 1024 * 100,
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      expect(() => validate_uploaded_file(valid_file)).not.toThrow()
    })
  })

  describe('get_file_info', () => {
    it('should return file information', () => {
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        encoding: '7bit',
        fieldname: 'file',
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(0),
      } as Express.Multer.File

      const info = get_file_info(file)

      expect(info.filename).toBe('test.jpg')
      expect(info.mimetype).toBe('image/jpeg')
      expect(info.size).toBe(1024)
      expect(info.encoding).toBe('7bit')
    })
  })
})
