import { createDb, type UssDb, type UssSchema } from "@uss/db";

const database = createDb(process.env.DATABASE_URL);

export const db: UssDb = database.db;
export const schema: UssSchema = database.schema;
