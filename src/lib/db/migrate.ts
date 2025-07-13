import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from ".";

dotenv.config();

interface MigrationOptions {
  dryRun?: boolean;
  verbose?: boolean;
  force?: boolean;
}

/**
 * Enhanced database migration function with better error handling and logging
 * @param options - Migration configuration options
 */
async function runMigrations(options: MigrationOptions = {}) {
  const { dryRun = false, verbose = true, force = false } = options;
  const migrationsFolder = path.join(process.cwd(), "migrations");

  try {
    // Check if migrations folder exists
    if (!fs.existsSync(migrationsFolder)) {
      console.warn(`⚠️  Migrations folder not found at: ${migrationsFolder}`);
      console.log('📝 Run "npm run db:generate" to create migrations first');
      return;
    }

    // Check if there are any migration files
    const migrationFiles = fs.readdirSync(migrationsFolder).filter(file => file.endsWith(".sql"));

    if (migrationFiles.length === 0) {
      console.log("✅ No migrations found - database is up to date");
      return;
    }

    if (verbose) {
      console.log("🚀 Starting database migrations...");
      console.log(`📁 Migrations folder: ${migrationsFolder}`);
      console.log(`📊 Found ${migrationFiles.length} migration file(s)`);

      if (dryRun) {
        console.log("🔍 DRY RUN MODE - No changes will be applied");
      }
    }

    // Test database connection
    if (verbose) {
      console.log("🔗 Testing database connection...");
    }

    await pool.query("SELECT 1");

    if (verbose) {
      console.log("✅ Database connection successful");
    }

    // Run migrations (skip if dry run)
    if (!dryRun) {
      const startTime = Date.now();

      await migrate(db, {
        migrationsFolder,
      });

      const duration = Date.now() - startTime;

      if (verbose) {
        console.log(`✅ Migrations completed successfully in ${duration}ms`);
      }
    } else {
      console.log("🔍 Dry run completed - migrations would be applied to:");
      migrationFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
    }
  } catch (error) {
    console.error("❌ Migration failed:");

    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);

      if (verbose && error.stack) {
        console.error("Stack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("Unknown error occurred:", error);
    }

    if (!force) {
      process.exit(1);
    }
  } finally {
    // Always close the pool
    try {
      await pool.end();
      if (verbose) {
        console.log("🔌 Database connection closed");
      }
    } catch (error) {
      console.warn("⚠️  Warning: Failed to close database connection properly");
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {};

  for (const arg of args) {
    switch (arg) {
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--quiet":
        options.verbose = false;
        break;
      case "--force":
        options.force = true;
        break;
      case "--help":
      case "-h":
        console.log(`
Database Migration Tool

Usage: npm run db:migrate [options]

Options:
  --dry-run    Preview migrations without applying them
  --verbose    Enable verbose logging (default)
  --quiet      Disable verbose logging
  --force      Continue on errors (not recommended)
  --help, -h   Show this help message

Examples:
  npm run db:migrate                    # Run migrations normally
  npm run db:migrate -- --dry-run       # Preview migrations
  npm run db:migrate -- --quiet         # Run with minimal output
                `);
        process.exit(0);
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  await runMigrations(options);
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

main();
