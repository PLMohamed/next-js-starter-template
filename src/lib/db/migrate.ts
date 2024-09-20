import dotenv from 'dotenv';
import path from 'path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '.';

dotenv.config();

async function main() {
    await migrate(db, {
        migrationsFolder: path.join(process.cwd(), '/migrations'),
    });

    console.log(`Migrations complete`);

    await pool.end();
}

main();