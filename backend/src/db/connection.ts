import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

export async function connect() {
  if (!dbPromise) {
    const filename = path.join(process.cwd(), 'nfl.db');
    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');

    dbPromise = open({
      filename,
      driver: sqlite3.Database
    });

    const db = await dbPromise;
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);
  }

  return dbPromise!;
}
