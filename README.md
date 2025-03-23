# vanilla-rest-client

A vanilla, no-dependency client for sending REST requests.



## Table of Contents
- [vanilla-rest-client](#vanilla-rest-client)
  - [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Usage](#usage)
    - [Import](#import)
    - [request](#request)
    - [.get](#get)
    - [.post](#post)
    - [.put](#put)
    - [.patch](#patch)
    - [.delete](#delete)
  - [License](#license)



## Install
This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/).

```bash
$ npm install vanilla-rest-client
```



## Usage

### Import
```ts
// A pre-instantiated instance of RestClient
import restClient from 'vanilla-rest-client';
```
```ts
// Requires instantiating your own instance
import { RestClient } from 'vanilla-rest-client';

const restClient = new RestClient();
```

### request
```ts
const response = restClient.request('GET', 'https://example.com');
```
```ts
const response = restClient.request('POST', 'https://example.com', {
    // Request Body
}, {
    // Headers
    // 'Content-Type': 'application/json' is added by default
});
```

### .get
```ts
const response = restClient.get('https://example.com', {
    // Headers
    // 'Content-Type': 'application/json' is added by default
});
```

### .post
```ts
const response = restClient.post('https://example.com', {
    // Request Body
}, {
    // Headers
    // 'Content-Type': 'application/json' is added by default
});
```

### .put
```ts
const response = restClient.put('https://example.com', {
    // Request Body
}, {
    // Headers
    // 'Content-Type': 'application/json' is added by default
});
```

### .patch
```ts
const response = restClient.patch('https://example.com', {
    // Request Body
}, {
    // Headers
    // 'Content-Type': 'application/json' is added by default
});
```

### .delete
```ts
const response = restClient.delete('https://example.com', {
    // Headers
    // 'Content-Type': 'application/json' is added by default
});
```



## License
[MIT](https://choosealicense.com/licenses/mit/)
