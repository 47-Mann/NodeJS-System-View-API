import mongoose from "mongoose";

export async function connectDB() {
  const uriCandidates = [
    process.env.MONGODB_URI,
    process.env.MONGO_URL,
    process.env.MONGODB_URL,
    process.env.DATABASE_URL,
  ].filter(Boolean);

  const mongoUri = uriCandidates.find(
    (uri) => uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"),
  );

  if (!mongoUri) {
    throw new Error(
      "MongoDB connection string not found. Set MONGODB_URI (recommended) or provide MONGO_URL/MONGODB_URL/DATABASE_URL with a mongodb:// or mongodb+srv:// value.",
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully");
}
