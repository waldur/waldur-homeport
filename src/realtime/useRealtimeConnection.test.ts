import { afterEach, describe, expect, it, vi } from 'vitest';
import { eventConsumersRegister } from 'waldur-js-client';

import {
  bindingSetKey,
  connectHeadersFor,
  register,
} from './useRealtimeConnection';

// waldur-js-client is mocked globally in test/setupTests.js, and nothing
// resets it between tests, so clear what these tests record on it.
afterEach(() => {
  vi.mocked(eventConsumersRegister).mockClear();
});

describe('connectHeadersFor', () => {
  it('takes user and vhost from the registration, not a previous one', () => {
    const headers = connectHeadersFor({
      rmq_username: 'fresh-user',
      vhost: 'fresh-vhost',
      queue_name: 'consumer_fresh',
      observable_object_types: [],
    });
    expect(headers).toMatchObject({ login: 'fresh-user', host: 'fresh-vhost' });
  });
});

describe('register', () => {
  it('registers an ephemeral consumer, so a closed tab is cleaned up', async () => {
    vi.mocked(eventConsumersRegister).mockResolvedValueOnce({
      data: { queue_name: 'consumer_abc' },
    } as Awaited<ReturnType<typeof eventConsumersRegister>>);
    const scopes = [{ type: 'user', uuid: 'u1' }];

    await register(scopes);

    expect(eventConsumersRegister).toHaveBeenCalledWith({
      body: expect.objectContaining({ scopes, ephemeral: true }),
    });
  });
});

describe('bindingSetKey', () => {
  const self = { type: 'user', uuid: 'u1' };

  it('is deterministic for identical candidate lists', () => {
    const a = [[{ type: 'customer', uuid: 'c1' }, self], [self]];
    const b = [[{ type: 'customer', uuid: 'c1' }, self], [self]];
    expect(bindingSetKey(a)).toEqual(bindingSetKey(b));
  });

  it('differs between workspaces', () => {
    const customerA = [[{ type: 'customer', uuid: 'c1' }, self], [self]];
    const customerB = [[{ type: 'customer', uuid: 'c2' }, self], [self]];
    expect(bindingSetKey(customerA)).not.toEqual(bindingSetKey(customerB));
  });

  it('distinguishes scope types with the same uuid', () => {
    const asCustomer = [[{ type: 'customer', uuid: 'x' }]];
    const asProject = [[{ type: 'project', uuid: 'x' }]];
    expect(bindingSetKey(asCustomer)).not.toEqual(bindingSetKey(asProject));
  });

  it('is sensitive to candidate order (fallback priority)', () => {
    const withSelf = [[{ type: 'project', uuid: 'p1' }, self], [self]];
    const selfFirst = [[self], [{ type: 'project', uuid: 'p1' }, self]];
    expect(bindingSetKey(withSelf)).not.toEqual(bindingSetKey(selfFirst));
  });
});
