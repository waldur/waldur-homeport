# Mocking HTTP Requests for Unit Tests

When writing unit tests for frontend components, it's crucial to isolate the component from external dependencies, especially network requests. Mocking HTTP requests allows us to simulate API responses and test our components in a predictable and controlled environment. This guide describes how to use `nock`, `got`, and React Testing Library (RTL) to achieve this.
By following these patterns, you can effectively mock HTTP requests in your unit tests, leading to more robust and reliable components.

## Key Libraries

- **[Nock](https://github.com/nock/nock)**: A powerful HTTP server mocking and expectations library for Node.js. It allows you to intercept outgoing HTTP requests and provide custom responses.
- **[Got](https://github.com/sindresorhus/got)**: A human-friendly and powerful HTTP request library for Node.js. We use it in tests to trigger the mocked endpoints and wait for `nock` to resolve them.
- **[React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/)**: A library for testing React components in a way that resembles how users interact with them.

## Basic Setup

To ensure a clean testing environment for each test case, we should set up `nock` before each test and clean up the mocks afterward. This is typically done in `beforeEach` and `afterEach` blocks.

```js
import { render, screen, waitFor } from '@testing-library/react';
import { got } from 'got';
import nock from 'nock';
import { afterEach, beforeEach, describe, it } from 'vitest';

// It's a good practice to define the base URL of your API to avoid repetition.
const API_URL = '<http://example.com';>

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup nock to intercept requests to our API.
    nock(API_URL)
      .get('/api/my-data/')
      .reply(200, { id: 1, name: 'Test Data' });
  });

  afterEach(() => {
    // Clean up all nock interceptors after each test.
    nock.cleanAll();
  });

  it('should fetch and display data', async () => {
    // Render your component which fetches data on mount.
    render(<MyComponent />);

    // Use got to trigger the request and wait for nock to handle it.
    await waitFor(() => got(`${API_URL}/api/my-data/`));

    // Assert that the component displays the mocked data.
    expect(screen.getByText('Test Data')).toBeInTheDocument();
  });
});
```

## Mocking Different Scenarios

### Successful GET Request

The example above shows a basic successful `GET` request. You can customize the response data to fit your test case.

```js
  nock('<http://example.com>')
  .get('/api/organization-groups/')
  .reply(200, [
    { name: 'Group 1', uuid: 'group-1-uuid' },
    { name: 'Group 2', uuid: 'group-2-uuid' },
  ]);
```

### Mocking Failed Requests

To test how your component handles API errors, you can mock a request to return an error status code.

```js
   nock('<http://example.com>')
  .get('/api/organization-groups/')
  .reply(400, { error: 'Invalid request' });

// In your test:
render(<MyComponent />);
await waitFor(() =>
  expect(
    screen.getByText('Unable to load organization groups.'),
  ).toBeInTheDocument(),
);
```
