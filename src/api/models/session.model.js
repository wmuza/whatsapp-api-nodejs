const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    hasCreds: {
        type: Boolean,
        default: false
    },
    user: {
        id: String,
        name: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['connecting', 'connected', 'disconnected'],
        default: 'disconnected'
    },
    qrCode: String,
    webhookUrl: String,
    lastConnected: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update timestamp on save
sessionSchema.pre('save', function(next) {
    this.updatedAt = Date.now()
    next()
})

const Session = mongoose.model('Session', sessionSchema)

module.exports = Session
