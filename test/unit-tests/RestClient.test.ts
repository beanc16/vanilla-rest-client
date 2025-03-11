import type {
    ClientRequest,
    IncomingMessage,
    RequestOptions,
} from 'node:http';

import * as Helpers from '../../src/helpers.js';
import restClientInstance, { type RequestBody, RestClient } from '../../src/index.js';
import { getFakeRequestBody } from './fakes/RestClient.js';

jest.mock('../../src/helpers.js', () =>
{
    return {
        getHttpModule: jest.fn().mockReturnValue({
            request: jest.fn().mockImplementation((
                _options: RequestOptions | string | URL,
                callback?: (res: IncomingMessage) => unknown,
            ) =>
            {
                const mockRes = {
                    statusCode: 200,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is used as the type in the original package
                    on: jest.fn((event: string, listener: (...args: any[]) => void) =>
                    {
                        if (event === 'data')
                        {
                            listener(Buffer.from(JSON.stringify({ message: 'Success' })));
                        }

                        else if (event === 'end')
                        {
                            listener();
                        }
                    }),
                } as unknown as IncomingMessage;

                if (typeof callback === 'function')
                {
                    callback(mockRes);
                }

                return {
                    end: jest.fn(),
                    write: jest.fn(),
                    on: jest.fn(),
                } as unknown as ClientRequest;
            }),
        }),
    };
});

describe.each([
    ['default export', restClientInstance],
    ['named export', new RestClient()],
])('RestClient (%s)', (_1, restClient) =>
{
    afterEach(() =>
    {
        jest.clearAllMocks();
    });

    describe.each([
        ['https URLs', 'https://example.com'],
        ['http URLs', 'http://example.com'],
    ])('%s', (_2, url) =>
    {
        describe.each([
            ['GET', { method: 'get', requestData: undefined }],
            ['POST', { method: 'post', requestData: getFakeRequestBody() }],
            ['PATCH', { method: 'patch', requestData: getFakeRequestBody() }],
            ['PUT', { method: 'put', requestData: getFakeRequestBody() }],
            ['DELETE', { method: 'delete', requestData: undefined }],
        // @ts-expect-error -- Type 'string' is not assignable to the given type, despite that being exactly what the type is in this case.
        ])('%s', (_3, { method, requestData }: { method: 'get' | 'post' | 'patch' | 'put' | 'delete'; requestData: RequestBody | undefined }) =>
        {
            it('should make a request successfully', async () =>
            {
                const getHttpModuleSpy = jest.spyOn(Helpers, 'getHttpModule');

                // @ts-expect-error -- The types are inconsistent between get/delete and post/patch/put, but are correct given the data setup.
                const response = await restClient[method](url, requestData);

                expect(response).toEqual({ message: 'Success' });
                expect(getHttpModuleSpy).toHaveBeenCalledWith(url);
            });

            it('should throw an error for an invalid JSON response', async () =>
            {
                const getHttpModuleSpy = jest.spyOn(Helpers, 'getHttpModule');

                // @ts-expect-error -- Mock only what's necessary for this test.
                getHttpModuleSpy.mockImplementationOnce(() =>
                {
                    return {
                        request: jest.fn().mockImplementation((
                            _options: RequestOptions | string | URL,
                            callback?: (res: IncomingMessage) => unknown,
                        ) =>
                        {
                            const mockRes = {
                                statusCode: 200,
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any is used as the type in the original package
                                on: jest.fn((event: string, listener: (...args: any[]) => void) =>
                                {
                                    if (event === 'data')
                                    {
                                        listener(Buffer.from('Invalid JSON'));
                                    }

                                    else if (event === 'end')
                                    {
                                        listener();
                                    }
                                }),
                            } as unknown as IncomingMessage;

                            if (typeof callback === 'function')
                            {
                                callback(mockRes);
                            }

                            return {
                                end: jest.fn(),
                                write: jest.fn(),
                                on: jest.fn(),
                            } as unknown as ClientRequest;
                        }),
                    };
                });

                await expect(
                    // @ts-expect-error -- The types are inconsistent between get/delete and post/patch/put, but are correct given the data setup.
                    restClient[method](url, requestData),
                ).rejects.toThrow('Failed to parse response JSON');
            });
        });
    });
});
