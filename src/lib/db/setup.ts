import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}

type GetPostgresURLResult = {
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
    DB_URL: string;
}

type getRedisURLResult = {
    REDIS_TOKEN: string;
    REDIS_URL: string;
}

async function getPostgresURL(): Promise<GetPostgresURLResult> {
    console.log('Step 1: Setting up Postgres');
    const dbChoice = await question(
        'Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): '
    );

    if (dbChoice.toLowerCase() === 'l') {
        console.log('Setting up local Postgres instance with Docker...');
        const CREDENTIALS = await setupLocalPostgres();
        return {
            DB_URL: `postgres://${CREDENTIALS.DB_USER}:${CREDENTIALS.DB_PASSWORD}@localhost:5432/${CREDENTIALS.DB_NAME}`,
            DB_NAME: CREDENTIALS.DB_NAME,
            DB_USER: CREDENTIALS.DB_USER,
            DB_PASSWORD: CREDENTIALS.DB_PASSWORD,
        }
    } else {
        console.log(
            'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
        );
        return {
            DB_URL: await question('Enter your POSTGRES_URL: ')
        }
    }
}

async function setupLocalPostgres() {
    console.log('\nChecking if Docker is installed...\n');
    try {
        await execAsync('docker --version');
        console.log('Docker is installed.\n');
    } catch {
        console.error(
            'Docker is not installed. Please install Docker and try again.'
        );
        console.log(
            'To install Docker, visit: https://docs.docker.com/get-docker/'
        );
        process.exit(1);
    }

    console.log('Creating docker-compose.yml file...');
    const dockerComposeContent = `
services:
  postgress:
    image: postgres:14.13-alpine3.20
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/dat

volumes:
  pgdata:
`;

    await fs.writeFile(
        path.join(process.cwd(), 'docker-compose.yml'),
        dockerComposeContent
    );
    console.log('docker-compose.yml file created.\n');

    return await setupPostgressCredentials();
}

async function setupPostgressCredentials() {
    console.log('Setting up Postgres credentials...');
    const DB_USER = await question('Enter your DATABASE USER: ');
    const DB_PASSWORD = await question('Enter your DATABASE PASSWORD: ');
    const DB_NAME = await question('Enter your DATABASE NAME: ');

    return {
        DB_USER,
        DB_PASSWORD,
        DB_NAME,
    };
}

async function getRedisURL(): Promise<getRedisURLResult> {
    console.log('Step 2: Setting up Redis');
    const redisChoice = await question(
        'Do you want to use a local Redis instance with Docker (L) or a remote upstash Redis instance (R)? (L/R): '
    );

    if (redisChoice.toLowerCase() === 'l') {
        console.log('Setting up local Redis instance with Docker...');
        const CREDENTIALS = await setupLocalRedis();
        return {
            REDIS_TOKEN: CREDENTIALS.REDIS_TOKEN,
            REDIS_URL: CREDENTIALS.REDIS_URL
        }
    } else {
        console.log(
            'You can find upstash Redis databases at: https://upstash.com/'
        );

        return {
            REDIS_TOKEN: await question('Enter your REDIS TOKEN: '),
            REDIS_URL: await question('Enter your REDIS URL: ')
        }
    }
}

async function setupLocalRedis() {
    console.log('\nChecking if Docker is installed...\n');
    try {
        await execAsync('docker --version');
        console.log('Docker is installed.\n');
    } catch {
        console.error(
            'Docker is not installed. Please install Docker and try again.'
        );
        console.log(
            'To install Docker, visit: https://docs.docker.com/get-docker/'
        );
        process.exit(1);
    }


    console.log("Checking if docker-compose.yml is created...\n")
    const redisDockerComposeContent = `
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
        - redisdata:/data
  
  serverless-redis-http:
    ports:
      - '8079:80'
    image: hiett/serverless-redis-http:latest
    environment:
      SRH_MODE: env
      SRH_TOKEN: \${REDIS_TOKEN}
      SRH_CONNECTION_STRING: 'redis://redis:6379'
    depends_on:
        - redis
    volumes:
        - redisdata:/data
        `

    try {
        const dockerComposeContent = await fs.readFile(path.join(process.cwd(), 'docker-compose.yml'), 'utf-8');
        console.log('docker-compose.yml file found.\n');

        let newDockerComposeContent = dockerComposeContent.replace('services:', 'services:' + redisDockerComposeContent);
        const lastIndex = newDockerComposeContent.lastIndexOf('volumes:');
        if (lastIndex !== -1) {
            newDockerComposeContent = newDockerComposeContent.slice(0, lastIndex) + 'volumes:\n  redisdata:' + newDockerComposeContent.slice(lastIndex + 'volumes:'.length);
        }

        await fs.writeFile(path.join(process.cwd(), 'docker-compose.yml'), newDockerComposeContent);

    } catch {
        console.log("docker-compose.yml file not found. Creating docker-compose.yml file...\n");

        const dockerComposeContent = `
services:
    ${redisDockerComposeContent}
volumes:
    redisdata:
    `
        try {


            await fs.writeFile(path.join(process.cwd(), 'docker-compose.yml'), dockerComposeContent);
            console.log('docker-compose.yml file created.\n');
        } catch {

            console.error(
                'Failed to create docker-compose.yml file. Please check your Docker installation and try again.'
            );
            process.exit(1);

        }

    }

    return await setupRedisCredentials();
}

async function setupRedisCredentials() {
    console.log('Setting up Redis credentials...');
    const REDIS_TOKEN = await question('Enter your REDIS TOKEN: ');

    return {
        REDIS_TOKEN,
        REDIS_URL: "http://localhost:8079"
    }
}

function generateAuthSecret(): string {
    console.log('\nStep 2: Generating AUTH_SECRET...\n');
    return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
    console.log('Step 3: Writing environment variables to .env');
    const envContent = Object.entries(envVars)
        .map(([key, value]) => `${key} = ${value}`)
        .join('\n');

    await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
    console.log('.env file created with the necessary variables.\n');
}

async function runningDockerContainer() {
    console.log('Starting Docker container with `docker compose up - d`...');
    try {
        await execAsync('docker compose up -d');
        console.log('Docker container started successfully.');
    } catch {
        console.error(
            'Failed to start Docker container. Please check your Docker installation and try again.'
        );
        process.exit(1);
    }
}

async function main() {
    const { DB_URL, DB_NAME, DB_PASSWORD, DB_USER } = await getPostgresURL();
    const { REDIS_TOKEN, REDIS_URL } = await getRedisURL();
    const AUTH_SECRET = generateAuthSecret();

    if (!DB_NAME || !DB_PASSWORD || !DB_USER)
        await writeEnvFile({
            DB_URL,
            AUTH_SECRET,
            REDIS_TOKEN,
            REDIS_URL,
            NEXT_PUBLIC_API_VERSION: "v1"

        });
    else {
        await writeEnvFile({
            DB_URL,
            DB_NAME,
            DB_PASSWORD,
            DB_USER,
            REDIS_TOKEN,
            REDIS_URL,
            AUTH_SECRET,
            NEXT_PUBLIC_API_VERSION: "v1"
        });

        await runningDockerContainer();
    }


    console.log('🎉 Setup completed successfully!');
}

main().catch(console.error);