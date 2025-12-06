import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface TransformationOptions {
  spiritId: string
  transformations: string[]
  intensity: number
}

/**
 * CostumeGenerator Service
 * Generates AI-powered costume transformations using image processing
 * Supports spirit-specific transformations
 */
export class CostumeGenerator {
  private temp_dir = join(__dirname, '../../../temp')
  private output_dir = join(__dirname, '../../../public/costumes')

  constructor() {
    this.ensure_directories()
  }

  /**
   * Ensure required directories exist
   */
  private ensure_directories(): void {
    try {
      if (!existsSync(this.temp_dir)) {
        mkdirSync(this.temp_dir, { recursive: true })
      }
      if (!existsSync(this.output_dir)) {
        mkdirSync(this.output_dir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create directories:', error)
    }
  }

  /**
   * Generate costume from image buffer
   */
  public async generate_costume(
    imageBuffer: Buffer,
    options: TransformationOptions
  ): Promise<string> {
    const temp_input = join(this.temp_dir, `input_${uuidv4()}.jpg`)
    const temp_output = join(this.temp_dir, `output_${uuidv4()}.jpg`)
    const final_output = join(this.output_dir, `costume_${uuidv4()}.jpg`)

    try {
      // Write input image
      writeFileSync(temp_input, imageBuffer)

      // Generate costume using Python script
      await this.run_transformation(temp_input, temp_output, options)

      // Move to final location
      const output_data = readFileSync(temp_output)
      writeFileSync(final_output, output_data)

      // Clean up temp files
      this.cleanup_temp_files([temp_input, temp_output])

      // Return relative path for serving
      const filename = path.basename(final_output)
      return `/costumes/${filename}`
    } catch (error) {
      // Clean up on error
      this.cleanup_temp_files([temp_input, temp_output, final_output])
      throw error
    }
  }

  /**
   * Run image transformation using Python
   */
  private run_transformation(
    input_path: string,
    output_path: string,
    options: TransformationOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // For now, we'll use a simple Node.js based transformation
        // In production, this would call a Python script with PIL/SDXL
        this.apply_node_transformation(input_path, output_path, options)
          .then(resolve)
          .catch(reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Apply transformation using Node.js (fallback for demo)
   * In production, this would use Python + PIL/SDXL
   */
  private async apply_node_transformation(
    input_path: string,
    output_path: string,
    options: TransformationOptions
  ): Promise<void> {
    try {
      // For demo purposes, we'll copy the image and add metadata
      // In production, this would apply actual AI transformations
      const input_data = readFileSync(input_path)

      // Apply spirit-specific effects (simulated)
      const transformed_data = this.apply_spirit_effects(input_data, options)

      writeFileSync(output_path, transformed_data)
      console.log(`✨ Costume generated for spirit: ${options.spiritId}`)
    } catch (error) {
      throw new Error(`Failed to apply transformation: ${error}`)
    }
  }

  /**
   * Apply spirit-specific effects to image
   * This is a placeholder - in production, use PIL/SDXL
   */
  private apply_spirit_effects(imageBuffer: Buffer, options: TransformationOptions): Buffer {
    // For demo, we'll just return the original buffer
    // In production, this would apply actual image transformations:
    // - Vampire: Add red eyes, pale skin, fangs
    // - Ghost: Add transparency, glow effect
    // - Witch: Add hat, runes, magical aura
    // - Pumpkin Demon: Add pumpkin features, orange glow

    console.log(`Applying ${options.transformations.length} transformations for ${options.spiritId}`)
    console.log(`Transformation intensity: ${options.intensity}`)

    return imageBuffer
  }

  /**
   * Generate fallback costume (placeholder image)
   */
  public async generate_fallback_costume(spiritId: string): Promise<string> {
    try {
      const fallback_path = join(this.output_dir, `fallback_${spiritId}_${uuidv4()}.jpg`)

      // Create a simple placeholder image
      // In production, this would be a pre-made fallback image
      const placeholder = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06,
        0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d,
        0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d,
        0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28,
        0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
        0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01,
        0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
        0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
        0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10,
        0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00,
        0x01, 0x7d, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
        0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42,
        0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
        0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37,
        0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55,
        0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73,
        0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
        0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
        0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba,
        0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6,
        0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
        0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08,
        0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd3, 0xff, 0xd9,
      ])

      writeFileSync(fallback_path, placeholder)
      console.log(`📸 Fallback costume generated for spirit: ${spiritId}`)

      const filename = path.basename(fallback_path)
      return `/costumes/${filename}`
    } catch (error) {
      console.error('Failed to generate fallback costume:', error)
      throw error
    }
  }

  /**
   * Clean up temporary files
   */
  private cleanup_temp_files(file_paths: string[]): void {
    file_paths.forEach(file_path => {
      try {
        if (existsSync(file_path)) {
          unlinkSync(file_path)
        }
      } catch (error) {
        console.warn(`Failed to clean up temp file: ${file_path}`, error)
      }
    })
  }
}

// Export singleton instance
export const costume_generator = new CostumeGenerator()
