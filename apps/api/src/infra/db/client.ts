import { createDb } from "@uss/db";

const { db, schema } = createDb(process.env.DATABASE_URL);

export { db, schema };
