import request from 'node:http';
import secureRequest from 'node:https';

import nock from 'nock';

import restClientInstance, { type RequestBody, RestClient } from '../../src/index.js';
import { getFakeRequestBody } from '../fakes/RestClient.js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
jest.mock('../../src/helpers.js', () =>
{
    return {
        getHttpModule: jest.fn((url: string) =>
        {
            return url.startsWith('https') ? secureRequest : request;
        }),
    };
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

describe.each([
    ['default export', restClientInstance],
    ['named export', new RestClient()],
])('RestClient (%s)', (_1, restClient) =>
{
    describe.each([
        ['https URLs', 'https://example.com'],
        ['http URLs', 'http://example.com'],
    ])('%s', (_2, baseUrl) =>
    {
        const successUrl = `${baseUrl}/success`;

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
                const responseData = {
                    message: 'Success',
                    ...(requestData ? { data: requestData } : {}),
                };

                // Mock the REST request
                nock(baseUrl)[method]('/success')
                    .reply(200, responseData);

                // @ts-expect-error -- The types are inconsistent between get/delete and post/patch/put, but are correct given the data setup.
                const response = await restClient[method](successUrl, requestData);

                expect(response).toEqual(responseData);
            });

            it.todo('should correctly parse large responses');

            it.todo('should throw an error for an invalid JSON response');

            // 400, 401, 403, 404, 500
            it.todo('should reject on a %s response');

            it.todo('should timeout if the request takes too long');
        });
    });
});
