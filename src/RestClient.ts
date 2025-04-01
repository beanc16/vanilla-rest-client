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
                    'Content-Type': 'application/json',
                    ...headers,
                },
            };

            const req = httpModule.request(options, (res: IncomingMessage) =>
            {
                let data = '';

                res.on('data', (chunk) =>
                {
                    data += chunk;
                });

                res.on('end', () =>
                {
                    try
                    {
                        resolve(JSON.parse(data) as Response);
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
    ): Promise<Response>
    {
        return this.request<Response>('GET', url, undefined, headers, queryParams);
    }

    public post<Response>(
        url: string,
        body: RequestBody,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
    ): Promise<Response>
    {
        return this.request<Response>('POST', url, body, headers, queryParams);
    }

    public patch<Response>(
        url: string,
        body: RequestBody,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
    ): Promise<Response>
    {
        return this.request<Response>('PATCH', url, body, headers, queryParams);
    }

    public put<Response>(
        url: string,
        body: RequestBody,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
    ): Promise<Response>
    {
        return this.request<Response>('PUT', url, body, headers, queryParams);
    }

    public delete<Response>(
        url: string,
        headers?: Record<string, string>,
        queryParams?: Record<string, string>,
    ): Promise<Response>
    {
        return this.request<Response>('DELETE', url, undefined, headers, queryParams);
    }
}
