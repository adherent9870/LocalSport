import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB_NAME ?? "playlocal";

const globalForMongo = globalThis as typeof globalThis & {
  __playlocalMongoClient?: MongoClient;
  __playlocalMongoIndexesEnsured?: boolean;
};

const client =
  globalForMongo.__playlocalMongoClient ??
  (mongodbUri
    ? new MongoClient(mongodbUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: false,
        },
      })
    : undefined);

if (process.env.NODE_ENV !== "production" && client) {
  globalForMongo.__playlocalMongoClient = client;
}

export function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function getDb() {
  if (!client) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await client.connect();

  const db = client.db(mongodbDbName);

  if (!globalForMongo.__playlocalMongoIndexesEnsured) {
    await Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("players").createIndex({ userId: 1 }, { unique: true, sparse: true }),
      db.collection("joinRequests").createIndex({ eventId: 1, playerId: 1 }, { unique: true }),
      db.collection("events").createIndex({ startTime: 1 }),
      db.collection("groups").createIndex({ area: 1, sport: 1 }),
      db.collection("spots").createIndex({ area: 1, sport: 1 }),
    ]);
    globalForMongo.__playlocalMongoIndexesEnsured = true;
  }

  return db;
}
