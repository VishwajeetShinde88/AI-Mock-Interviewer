import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./utils/schema.js",
  dialect: "postgresql",  // This is correct
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_evQs2AbGMVJ0@ep-tiny-leaf-a55ttoih-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
  out: "./drizzle",  // Directory to store migrations, adjust as needed
});
