import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export interface UploadResult {
  url: string
  key: string
}

export class R2UploadService {
  static async uploadFile(file: File, folder = 'ShareVault'): Promise<UploadResult> {
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}_${randomString}.${extension}`
      const key = `${folder}/${filename}`

      // Convert file to buffer
      const buffer = await file.arrayBuffer()

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: file.type,
      })

      await r2Client.send(command)

      // Return public URL
      const url = `${process.env.R2_PUBLIC_URL}/${key}`

      return {
        url,
        key
      }
    } catch (error) {
      console.error('Error uploading file to R2:', error)
      throw new Error('Failed to upload file')
    }
  }

  static async uploadMultipleFiles(files: File[], folder = 'ShareVault'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder))
    return Promise.all(uploadPromises)
  }
}