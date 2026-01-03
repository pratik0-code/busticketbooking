
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        if (!MONGODB_URI) {
            // Fallback for development
            const fallbackURI = 'mongodb://localhost:27017/bus-booking-system';
            console.warn(`MONGODB_URI not found, using fallback: ${fallbackURI}`);

            cached.promise = mongoose.connect(fallbackURI, opts).then((mongoose) => {
                return mongoose.connection;
            });
        } else {
            cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
                return mongoose.connection;
            });
        }
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
