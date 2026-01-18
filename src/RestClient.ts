import type { IncomingMessage, RequestOptions } from 'node:http';

import { getHttpModule } from './helpers.js';
import type { RequestBody, RestMethod } from './types.js';

export class RestClient
{
    // eslint-disable-next-line class-methods-use-this
    public async request<Response>(
        method: RestMethod,
        url: string,
        body?: RequestBody,
        headers: Record<string, string> = {},
        queryParams: Record<string, string> = {},
        contentType = 'application/json',
    ): Promise<Response>
    {
        return await new Promise((resolve, reject) =>
        {
            const urlObj = new URL(url);
            const httpModule = getHttpModule(url);

            const options: RequestOptions = {
                method,
                hostname: urlObj.hostname,
                port: urlObj.port || (url.startsWith('https') ? 443 : 80),
                path: `${urlObj.pathname}${new URLSearchParams(queryParams).toString()}`,
                headers: {
                    'Content-Type': contentType,
                    ...headers,
                },
            };

            const req = httpModule.request(options, (res: IncomingMessage) =>
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is as the type in the chunk
                const chunks: any[] = [];

                res.on('data', (chunk) =>
                {
                    chunks.push(chunk);
                });

                res.on('end', () =>
                {
                    const buffer = Buffer.concat(chunks);

                    try
                    {
                        if (contentType?.includes('application/json'))
                        {
                            resolve(JSON.parse(buffer.toString()) as Response);
                        }
                        else
                        {
                            resolve(buffer as Response); // Return raw buffer for non-JSON
                        }
                    }
                    catch (error)
                    {
                        reject(new Error('Failed to parse response JSON'));
                    }
                });
            });

            req.on('error', (error) =>
            {
                reject(error);
            });

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH'))
            {
                req.write(JSON.stringify(body));
            }

            req.end();
        });
    }

    public get<Response>(
        url: string,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
        contentType?: string,
    ): Promise<Response>
    {
        return this.request<Response>('GET', url, undefined, headers, queryParams, contentType);
    }

    public post<Response>(
        url: string,
        body: RequestBody,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
        contentType?: string,
    ): Promise<Response>
    {
        return this.request<Response>('POST', url, body, headers, queryParams, contentType);
    }

    public patch<Response>(
        url: string,
        body: RequestBody,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
        contentType?: string,
    ): Promise<Response>
    {
        return this.request<Response>('PATCH', url, body, headers, queryParams, contentType);
    }

    public put<Response>(
        url: string,
        body: RequestBody,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
        contentType?: string,
    ): Promise<Response>
    {
        return this.request<Response>('PUT', url, body, headers, queryParams, contentType);
    }

    public delete<Response>(
        url: string,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
        contentType?: string,
    ): Promise<Response>
    {
        return this.request<Response>('DELETE', url, undefined, headers, queryParams, contentType);
    }
}
