// Port number
const PORT = process.env.PORT || '3333'
const TOKEN = process.env.TOKEN || ''
const PROTECT_ROUTES = !!(
    process.env.PROTECT_ROUTES && process.env.PROTECT_ROUTES === 'true'
)

const RESTORE_SESSIONS_ON_START_UP = !!(
    process.env.RESTORE_SESSIONS_ON_START_UP &&
    process.env.RESTORE_SESSIONS_ON_START_UP === 'true'
)

const APP_URL = process.env.APP_URL || false

const LOG_LEVEL = process.env.LOG_LEVEL

const INSTANCE_MAX_RETRY_QR = process.env.INSTANCE_MAX_RETRY_QR || 2

const CLIENT_PLATFORM = process.env.CLIENT_PLATFORM || 'Whatsapp MD'
const CLIENT_BROWSER = process.env.CLIENT_BROWSER || 'Chrome'
const CLIENT_VERSION = process.env.CLIENT_VERSION || '4.0.0'

// Enable or disable mongodb
const MONGODB_ENABLED = !!(
    process.env.MONGODB_ENABLED && process.env.MONGODB_ENABLED === 'true'
)
// URL of the Mongo DB
const MONGODB_URL =
    process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/WhatsAppInstance'
// Enable or disable webhook globally on project
const WEBHOOK_ENABLED = !!(
    process.env.WEBHOOK_ENABLED && process.env.WEBHOOK_ENABLED === 'true'
)
// Webhook URL
const WEBHOOK_URL = process.env.WEBHOOK_URL
// Receive message content in webhook (Base64 format)
const WEBHOOK_BASE64 = !!(
    process.env.WEBHOOK_BASE64 && process.env.WEBHOOK_BASE64 === 'true'
)
// allowed events which should be sent to webhook
const WEBHOOK_ALLOWED_EVENTS = process.env.WEBHOOK_ALLOWED_EVENTS?.split(',') || ['all']
// Mark messages as seen
const MARK_MESSAGES_READ = !!(
    process.env.MARK_MESSAGES_READ && process.env.MARK_MESSAGES_READ === 'true'
)

// Google Cloud Storage configuration
const GCS_ENABLED = !!(
    process.env.GCS_ENABLED && process.env.GCS_ENABLED === 'true'
)
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || ''
const GCS_PROJECT_ID = process.env.GCS_PROJECT_ID || ''
const GCS_KEY_FILE = process.env.GCS_KEY_FILE || ''
const GCS_CREDENTIALS = process.env.STORAGE_CREDENTIALS || process.env.GCS_CREDENTIALS || ''
const GCS_PUBLIC_URL_BASE = process.env.GCS_PUBLIC_URL_BASE || ''

module.exports = {
    port: PORT,
    token: TOKEN,
    restoreSessionsOnStartup: RESTORE_SESSIONS_ON_START_UP,
    appUrl: APP_URL,
    log: {
        level: LOG_LEVEL,
    },
    instance: {
        maxRetryQr: INSTANCE_MAX_RETRY_QR,
    },
    mongoose: {
        enabled: MONGODB_ENABLED,
        url: MONGODB_URL,
        options: {
            // useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
    browser: {
        platform: CLIENT_PLATFORM,
        browser: CLIENT_BROWSER,
        version: CLIENT_VERSION,
    },
    webhookEnabled: WEBHOOK_ENABLED,
    webhookUrl: WEBHOOK_URL,
    webhookBase64: WEBHOOK_BASE64,
    protectRoutes: PROTECT_ROUTES,
    markMessagesRead: MARK_MESSAGES_READ,
    webhookAllowedEvents: WEBHOOK_ALLOWED_EVENTS,
    gcs: {
        enabled: GCS_ENABLED,
        bucketName: GCS_BUCKET_NAME,
        projectId: GCS_PROJECT_ID,
        keyFile: GCS_KEY_FILE,
        credentials: GCS_CREDENTIALS,
        publicUrlBase: GCS_PUBLIC_URL_BASE
    }
}
