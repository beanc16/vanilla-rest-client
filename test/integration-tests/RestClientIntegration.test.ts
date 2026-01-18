import nock from 'nock';

import restClientInstance, { type RequestBody, RestClient } from '../../src/index.js';
import { getFakeRequestBody } from '../fakes/RestClient.js';

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
            const successResponseData = {
                message: 'Success',
                ...(requestData ? { data: requestData } : {}),
            };

            beforeEach(() =>
            {
                // Mock the REST request
                nock(
                    baseUrl,
                )[method]('/success').reply(
                    200,
                    successResponseData,
                )[method]('/invalid').reply(
                    200,
                    'Invalid JSON',
                );
            });

            afterEach(() =>
            {
                nock.cleanAll();
            });

            it('should make a request successfully', async () =>
            {
                // @ts-expect-error -- The types are inconsistent between get/delete and post/patch/put, but are correct given the data setup.
                const response = await restClient[method](successUrl, requestData);

                expect(response).toEqual(successResponseData);
            });

            it('should throw an error for an invalid JSON response', async () =>
            {
                // @ts-expect-error -- The types are inconsistent between get/delete and post/patch/put, but are correct given the data setup.
                const promise = restClient[method](`${baseUrl}/invalid`, requestData);

                await expect(promise).rejects.toThrow();
            });

            it.todo('should timeout if the request takes too long');
        });

        describe.each([
            ['GET', { method: 'get' }],
            ['DELETE', { method: 'delete' }],
        // @ts-expect-error -- Type 'string' is not assignable to the given type, despite that being exactly what the type is in this case.
        ])('%s', (_3, { method }: { method: 'get' | 'delete' }) =>
        {
            it('should make a request with a Buffer return type successfully', async () =>
            {
                const response = await restClient[method](successUrl, undefined, undefined, 'application/octet-stream');

                expect(response instanceof Buffer).toEqual(true);
            });
        });

        describe.each([
            ['POST', { method: 'post', requestData: getFakeRequestBody() }],
            ['PATCH', { method: 'patch', requestData: getFakeRequestBody() }],
            ['PUT', { method: 'put', requestData: getFakeRequestBody() }],
        // @ts-expect-error -- Type 'string' is not assignable to the given type, despite that being exactly what the type is in this case.
        ])('%s', (_3, { method, requestData }: { method: 'post' | 'patch' | 'put'; requestData: RequestBody | undefined }) =>
        {
            it('should make a request with a Buffer return type successfully', async () =>
            {
                // @ts-expect-error -- The types are inconsistent between get/delete and post/patch/put, but are correct given the data setup.
                const response = await restClient[method](successUrl, requestData, undefined, undefined, 'application/octet-stream');

                expect(response instanceof Buffer).toEqual(true);
            });
        });
    });
});
