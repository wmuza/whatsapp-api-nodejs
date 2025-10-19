const mongoose = require('mongoose');
const { initAuthCreds } = require('@whiskeysockets/baileys');
const { BufferJSON } = require('@whiskeysockets/baileys');

// Create a dynamic Mongoose model for each session
function createAuthModel(sessionId) {
    const collectionName = `auth_${sessionId}`;

    // Define schema
    const authDataSchema = new mongoose.Schema({
        _id: { type: String, required: true },
        value: mongoose.Schema.Types.Mixed
    }, {
        strict: false,
        collection: collectionName
    });

    // Check if model already exists
    if (mongoose.models[collectionName]) {
        return mongoose.models[collectionName];
    }

    return mongoose.model(collectionName, authDataSchema);
}

/**
 * Mongoose-based auth state for Baileys
 * Based on whatsapp-api-local implementation
 * @param {string} sessionId - Unique session identifier
 */
async function useMongooseAuthState(sessionId) {
    const AuthModel = createAuthModel(sessionId);

    // Write data to MongoDB
    const writeData = async (data, id) => {
        try {
            await AuthModel.findOneAndUpdate(
                { _id: id },
                { _id: id, value: JSON.parse(JSON.stringify(data, BufferJSON.replacer)) },
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error(`[${sessionId}] Error writing data:`, error);
            throw error;
        }
    };

    // Read data from MongoDB
    const readData = async (id) => {
        try {
            const doc = await AuthModel.findOne({ _id: id });
            if (!doc || !doc.value) {
                return null;
            }
            const data = JSON.stringify(doc.value);
            return JSON.parse(data, BufferJSON.reviver);
        } catch (error) {
            console.error(`[${sessionId}] Error reading data:`, error);
            return null;
        }
    };

    // Remove data from MongoDB
    const removeData = async (id) => {
        try {
            await AuthModel.deleteOne({ _id: id });
        } catch (error) {
            console.error(`[${sessionId}] Error removing data:`, error);
        }
    };

    // Initialize or load credentials
    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            try {
                                const value = await readData(`${type}-${id}`);
                                data[id] = value;
                            } catch (error) {
                                console.error(`[${sessionId}] Error getting ${type}-${id}:`, error);
                                data[id] = null;
                            }
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category of Object.keys(data)) {
                        for (const id of Object.keys(data[category])) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            tasks.push(
                                value ? writeData(value, key) : removeData(key)
                            );
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: async () => {
            await writeData(creds, 'creds');
        }
    };
}

module.exports = useMongooseAuthState;
