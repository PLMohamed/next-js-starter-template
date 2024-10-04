import { RouteParams } from '@/types/data/page';
import { createServer } from 'http';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Utility function to create a server for testing Next.js API routes
 * 
 * @param handler - The Next.js API handler (GET, POST, etc.)
 * @returns {http.Server} - The created HTTP server
 */
export function createTestServer(handler: (req: NextRequest, { params }: { params: RouteParams }) => Promise<NextResponse>) {
    const server = createServer((req, res) => {
        const nextReq = req as unknown as NextRequest;
        nextReq.headers.get = (key: string) => {
            const value = req.headers[key];
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            return value || null;
        };

        nextReq.json = async () => {
            let body = '';

            for await (const chunk of req)
                body += chunk;

            if (!body)
                return JSON.parse('{}');

            return JSON.parse(body);
        }

        return handler(nextReq, { params: {} }).then((response) => {
            res.writeHead(response.status);
            res.end(JSON.stringify(response.body));
        });
    });

    return server;
}


