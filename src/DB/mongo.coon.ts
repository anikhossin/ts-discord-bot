import { MongoClient, Db, Collection, Document } from "mongodb";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Missing required environment variables");
  process.exit(1);
}

let client: MongoClient | null = null;

const dbCache: { [key: string]: Db } = {};

export const getClient = async () => {
  if (!client) {
    client = new MongoClient(uri, {
      maxConnecting: 25,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    const resualt = await client.db("admin").command({ ping: 1 });
    console.log(`MongoDB ping result: ${resualt.ok}`);
  }
  return client;
};

export const getDatabase = async (dbName: string): Promise<Db> => {
  if (!dbCache[dbName]) {
    const client = await getClient();
    dbCache[dbName] = client.db(dbName);
  }
  return dbCache[dbName];
};

// Add 'extends Document' constraint to T
export const getCollection = async <T extends Document>(
  dbName: string,
  collectionName: string
): Promise<Collection<T>> => {
  const db = await getDatabase(dbName);
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
  }
};
