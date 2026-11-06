import mongoose from "mongoose";

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Reuse a single connection across Next.js hot reloads and serverless invocations.
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? {
  connection: null,
  promise: null,
};

global.mongooseCache = cache;

export class DatabaseConfigurationError extends Error {}

// Connect to MongoDB once and reuse the same connection for later requests.
export async function connectToDatabase() {
  if (cache.connection) return cache.connection;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new DatabaseConfigurationError(
      "MONGO_URI is not configured. Add it to the local .env file.",
    );
  }

  // Share an in-flight connection promise so parallel requests do not open duplicate pools.
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,
      })
      .then((connection) => connection)
      .catch((error: unknown) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
