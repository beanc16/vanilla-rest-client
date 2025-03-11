import request from 'node:http';
import secureRequest from 'node:https';

import { getHttpModule } from '../../src/helpers.js';

describe('getHttpModule', () =>
{
    it.each([
        ['secure request', 'https URLs', {
            url: 'https://example.com',
            expectedResult: secureRequest,
        }],
        ['request', 'http URLs', {
            url: 'http://example.com',
            expectedResult: request,
        }],
    ])('should return the request module for %s', (_1, _2, { url, expectedResult }) =>
    {
        const result = getHttpModule(url);
        expect(result).toEqual(expectedResult);
    });
});
