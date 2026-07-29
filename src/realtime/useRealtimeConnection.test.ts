import { describe, expect, it } from 'vitest';

import { bindingSetKey } from './useRealtimeConnection';

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
