import request from 'node:http';
import secureRequest from 'node:https';

export const getHttpModule = (url: string): typeof request | typeof secureRequest =>
{
    return url.startsWith('https') ? secureRequest : request;
};
