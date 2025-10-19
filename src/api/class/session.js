/* eslint-disable no-unsafe-optional-chaining */
const { WhatsAppInstance } = require('../class/instance')
const logger = require('pino')()
const config = require('../../config/config')
const SessionModel = require('../models/session.model')

class Session {
    async restoreSessions() {
        let restoredSessions = []
        try {
            logger.info('Restoring sessions from MongoDB...')

            // Find all sessions that have valid credentials
            const sessions = await SessionModel.find({ hasCreds: true })

            logger.info(`Found ${sessions.length} session(s) with credentials to restore`)

            for (const session of sessions) {
                try {
                    logger.info(`Restoring session: ${session.sessionId}`)

                    const webhook = !config.webhookEnabled
                        ? undefined
                        : config.webhookEnabled
                    const webhookUrl = session.webhookUrl || config.webhookUrl

                    const instance = new WhatsAppInstance(
                        session.sessionId,
                        webhook,
                        webhookUrl
                    )

                    await instance.init()
                    WhatsAppInstances[session.sessionId] = instance
                    restoredSessions.push(session.sessionId)

                    // Add delay between session restorations to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 2000))
                } catch (err) {
                    logger.error(`Failed to restore session ${session.sessionId}: ${err.message}`)
                }
            }

            logger.info(`Successfully restored ${restoredSessions.length} session(s)`)
        } catch (e) {
            logger.error('Error restoring sessions')
            logger.error(e)
        }
        return restoredSessions
    }
}

exports.Session = Session
