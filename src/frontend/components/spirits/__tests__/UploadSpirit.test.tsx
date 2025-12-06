import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { UploadSpirit } from '../UploadSpirit'

vi.mock('axios')

const mock_spirits = [
  {
    id: 'ghost',
    name: 'Phantom',
    description: 'A mournful spirit',
    color_theme: '#e0e0ff',
  },
  {
    id: 'vampire',
    name: 'Nosferatu',
    description: 'An ancient bloodsucker',
    color_theme: '#8b0000',
  },
]

describe('UploadSpirit Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(axios.get as any).mockResolvedValue({
      data: {
        success: true,
        data: mock_spirits,
      },
    })
  })

  describe('Rendering', () => {
    it('should render upload component', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })
    })

    it('should display all available spirits', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText('Phantom')).toBeInTheDocument()
        expect(screen.getByText('Nosferatu')).toBeInTheDocument()
      })
    })

    it('should display upload prompt initially', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText(/Drag your selfie here/)).toBeInTheDocument()
      })
    })

    it('should show loading state when isLoading is true', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={true} />)

      await waitFor(() => {
        const summon_button = screen.getByRole('button', { name: /Summoning/i })
        expect(summon_button).toBeDisabled()
      })
    })
  })

  describe('File Upload', () => {
    it('should render file input', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      // Wait for spirits to load
      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    })

    it('should display upload prompt initially', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText(/Drag your selfie here/)).toBeInTheDocument()
      })
    })

    it('should validate file format on change', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' })

      // Simulate file change
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/)).toBeInTheDocument()
      })
    })

    it('should validate file size on change', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const large_file = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      })

      fireEvent.change(input, { target: { files: [large_file] } })

      await waitFor(() => {
        expect(screen.getByText(/File too large/)).toBeInTheDocument()
      })
    })

    it('should accept valid image files', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeInTheDocument()
      })
    })
  })

  describe('Spirit Selection', () => {
    it('should allow spirit selection', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        const phantom_button = screen.getByRole('button', { name: /Phantom/ })
        expect(phantom_button).toBeInTheDocument()
      })

      const phantom_button = screen.getByRole('button', { name: /Phantom/ })
      fireEvent.click(phantom_button)

      expect(phantom_button).toHaveClass('selected')
    })

    it('should allow changing spirit selection', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        const phantom_button = screen.getByRole('button', { name: /Phantom/ })
        fireEvent.click(phantom_button)
      })

      const phantom_button = screen.getByRole('button', { name: /Phantom/ })
      expect(phantom_button).toHaveClass('selected')

      const nosferatu_button = screen.getByRole('button', { name: /Nosferatu/ })
      fireEvent.click(nosferatu_button)

      expect(phantom_button).not.toHaveClass('selected')
      expect(nosferatu_button).toHaveClass('selected')
    })
  })

  describe('Upload Validation', () => {
    it('should require both file and spirit before upload', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const summon_button = screen.getByRole('button', { name: /Summon Spirit/ })
      expect(summon_button).toBeDisabled()
    })

    it('should enable upload button when file and spirit are selected', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      // Wait for spirits to load
      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      // Select file
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      await userEvent.upload(input, file)

      // Select spirit
      const phantom_button = screen.getByRole('button', { name: /Phantom/ })
      fireEvent.click(phantom_button)

      // Check upload button is enabled
      await waitFor(() => {
        const summon_button = screen.getByRole('button', { name: /Summon Spirit/ })
        expect(summon_button).not.toBeDisabled()
      })
    })

    it('should enable upload button when file and spirit are selected', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      // Wait for spirits to load
      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      // Initially button should be disabled
      let summon_button = screen.getByRole('button', { name: /Summon Spirit/ })
      expect(summon_button).toBeDisabled()

      // Select file
      const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      // Select spirit
      const phantom_button = screen.getByRole('button', { name: /Phantom/ })
      fireEvent.click(phantom_button)

      // Now button should be enabled
      await waitFor(() => {
        summon_button = screen.getByRole('button', { name: /Summon Spirit/ })
        expect(summon_button).not.toBeDisabled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message for invalid file', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      // Wait for spirits to load
      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/)).toBeInTheDocument()
      })
    })

    it('should clear error when valid file is selected', async () => {
      const mock_on_upload = vi.fn()
      render(<UploadSpirit onUpload={mock_on_upload} isLoading={false} />)

      // Wait for spirits to load
      await waitFor(() => {
        expect(screen.getByText('Choose a Spirit to Summon')).toBeInTheDocument()
      })

      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      // Upload invalid file
      const invalid_file = new File(['dummy content'], 'test.txt', { type: 'text/plain' })
      fireEvent.change(input, { target: { files: [invalid_file] } })

      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/)).toBeInTheDocument()
      })

      // Upload valid file
      const valid_file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })
      fireEvent.change(input, { target: { files: [valid_file] } })

      await waitFor(() => {
        expect(screen.queryByText(/Invalid file format/)).not.toBeInTheDocument()
      })
    })
  })
})
