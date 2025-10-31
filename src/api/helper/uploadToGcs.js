const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const config = require('../../config/config')

let storage = null

// Initialize storage client
function getStorageClient() {
    if (!storage) {
        const storageOptions = {
            projectId: config.gcs.projectId
        }

        // Priority 1: Use inline credentials JSON (same as backend STORAGE_CREDENTIALS)
        if (config.gcs.credentials) {
            try {
                // Parse credentials if it's a JSON string
                const credentials = typeof config.gcs.credentials === 'string'
                    ? JSON.parse(config.gcs.credentials)
                    : config.gcs.credentials
                storageOptions.credentials = credentials
            } catch (error) {
                console.error('Failed to parse GCS credentials:', error)
                throw new Error('Invalid GCS credentials format')
            }
        }
        // Priority 2: Use keyFile path if provided
        else if (config.gcs.keyFile) {
            storageOptions.keyFilename = config.gcs.keyFile
        }
        // Priority 3: Rely on default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)

        storage = new Storage(storageOptions)
    }
    return storage
}

// Get file extension and mime type from message type
function getFileInfo(messageType) {
    const fileTypes = {
        'image': { ext: 'jpg', mimeType: 'image/jpeg' },
        'video': { ext: 'mp4', mimeType: 'video/mp4' },
        'audio': { ext: 'ogg', mimeType: 'audio/ogg' },
        'document': { ext: 'pdf', mimeType: 'application/pdf' }
    }
    return fileTypes[messageType] || { ext: 'bin', mimeType: 'application/octet-stream' }
}

/**
 * Upload media buffer to Google Cloud Storage
 * @param {Buffer} buffer - The media buffer to upload
 * @param {string} messageType - Type of message (image, video, audio, document)
 * @param {string} instanceKey - WhatsApp instance key
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
async function uploadToGcs(buffer, messageType, instanceKey) {
    if (!config.gcs.enabled) {
        throw new Error('GCS is not enabled')
    }

    if (!config.gcs.bucketName) {
        throw new Error('GCS bucket name is not configured')
    }

    try {
        const storageClient = getStorageClient()
        const bucket = storageClient.bucket(config.gcs.bucketName)

        // Generate unique filename
        const fileInfo = getFileInfo(messageType)
        const filename = `whatsapp-media/${instanceKey}/${Date.now()}-${uuidv4()}.${fileInfo.ext}`

        const file = bucket.file(filename)

        // Convert base64 to buffer if needed
        const fileBuffer = typeof buffer === 'string'
            ? Buffer.from(buffer, 'base64')
            : buffer

        // Upload file
        await file.save(fileBuffer, {
            metadata: {
                contentType: fileInfo.mimeType,
                metadata: {
                    uploadedBy: 'whatsapp-api-nodejs',
                    instanceKey: instanceKey,
                    messageType: messageType,
                    uploadedAt: new Date().toISOString()
                }
            },
            public: true // Make file publicly accessible
        })

        // Make file public (double-check)
        await file.makePublic()

        // Return public URL
        if (config.gcs.publicUrlBase) {
            // Use custom public URL base if provided (e.g., CDN)
            return `${config.gcs.publicUrlBase}/${filename}`
        } else {
            // Use default GCS public URL
            return `https://storage.googleapis.com/${config.gcs.bucketName}/${filename}`
        }
    } catch (error) {
        console.error('Failed to upload to GCS:', error)
        throw error
    }
}

module.exports = uploadToGcs
