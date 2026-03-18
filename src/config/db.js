import mongoose from "mongoose";

export async function connectDB() {
  const uriEnvNames = [
    "MONGODB_URI",
    "MONGO_URL",
    "MONGODB_URL",
    "DATABASE_URL",
    "MONGO_PUBLIC_URL",
    "MONGO_PRIVATE_URL",
    "MONGODB_PUBLIC_URL",
    "MONGODB_PRIVATE_URL",
  ];

  const normalizeUri = (value) => value?.trim().replace(/^['"]|['"]$/g, "");

  const uriCandidates = uriEnvNames
    .map((envName) => ({ envName, value: normalizeUri(process.env[envName]) }))
    .filter(({ value }) => Boolean(value));

  const mongoUriEntry = uriCandidates.find(({ value }) =>
    /^mongodb(\+srv)?:\/\//.test(value),
  );

  if (!mongoUriEntry) {
    const providedVars =
      uriCandidates.map(({ envName }) => envName).join(", ") || "none";

    throw new Error(
      `MongoDB connection string not found. Set MONGODB_URI (recommended) or provide MONGO_URL/MONGODB_URL/DATABASE_URL/MONGO_PUBLIC_URL/MONGO_PRIVATE_URL with a mongodb:// or mongodb+srv:// value (without quotes). Provided vars: ${providedVars}.`,
    );
  }

  await mongoose.connect(mongoUriEntry.value);
  console.log(`MongoDB connected successfully using ${mongoUriEntry.envName}`);
}
