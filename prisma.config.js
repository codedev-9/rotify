import 'dotenv/config'
import { defineConfig } from "@prisma/config";

console.log(process.env.DATABASE_URL)

export default defineConfig({
  schema: "./prisma/schema.prisma",

  datasources: {   // ← FIXED (plural)
    db: {
      url: process.env.DATABASE_URL,
    },
  },

  migrate: {
    connectionString: process.env.DATABASE_URL,
  },
});
