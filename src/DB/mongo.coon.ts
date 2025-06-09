import { MongoClient, Db, Collection, Document } from "mongodb";


let client: MongoClient | null = null;

const dbCache: { [key: string]: Db } = {};

export const getClient = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MongoDB URI is not defined in environment variables.");
    return null;
  }
  if (!client) {
    client = new MongoClient(uri, {
      maxConnecting: 25,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    const result = await client.db("admin").command({ ping: 1 });
    console.log(`MongoDB ping result: ${result.ok}`);
  }
  return client;
};

export const getDatabase = async (dbName: string): Promise<Db | null> => {
  if (!client) {
    const clientInstance = await getClient();
    if (!clientInstance) {
      console.error("Failed to connect to MongoDB client.");
      return null;
    }
  }
  if (!dbCache[dbName]) {
    const clientInstance = await getClient();
    if (!clientInstance) {
      return null;
    }
    dbCache[dbName] = clientInstance.db(dbName);
  }
  return dbCache[dbName];
};

// Add 'extends Document' constraint to T
export const getCollection = async <T extends Document>(
  dbName: string,
  collectionName: string
): Promise<Collection<T> | null> => {
  const db = await getDatabase(dbName);
  if (!db) {
    return null;
  }
  const collection = db.collection<T>(collectionName);
  if (!collection) {
    await db.createCollection(collectionName);
    return db.collection<T>(collectionName);
  }
  return collection;
};

export const closeClient = async () => {
  if (client) {
    await client.close();
    client = null;
    // Clear the database cache when closing client
    Object.keys(dbCache).forEach(key => delete dbCache[key]);
  }
};
