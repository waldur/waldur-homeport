import { describe, expect, it, vi } from 'vitest';
import { User } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { hasPermission } from '@/permissions/hasPermission';

import {
  BulkOffering,
  getSharedCustomerUuid,
  getStateActionTargets,
  runOfferingBatch,
} from './bulkOfferingActions';

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn(() => true),
}));

const offering = (
  uuid: string,
  state: string,
  customer_uuid = 'customer-1',
): BulkOffering => ({
  uuid,
  name: `Offering ${uuid}`,
  state: state as BulkOffering['state'],
  customer_uuid,
  plans: [],
  type: 'Marketplace.Basic',
});

const staff = { is_staff: true } as User;
const provider = { is_staff: false } as User;

describe('runOfferingBatch', () => {
  it('reports every success and failure in input order', async () => {
    const offerings = [
      offering('a', 'Active'),
      offering('b', 'Active'),
      offering('c', 'Active'),
    ];
    const result = await runOfferingBatch(offerings, (item) =>
      item.uuid === 'b'
        ? Promise.reject(new Error('refused'))
        : Promise.resolve(item.uuid.toUpperCase()),
    );

    expect(result.succeeded.map((item) => item.uuid)).toEqual(['a', 'c']);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].offering.uuid).toBe('b');
    expect((result.failed[0].error as Error).message).toBe('refused');
    expect(result.values.get(offerings[2])).toBe('C');
  });

  it('keeps no more requests in flight than the concurrency limit', async () => {
    let inFlight = 0;
    let peak = 0;
    const offerings = Array.from({ length: 12 }, (_, index) =>
      offering(String(index), 'Active'),
    );
    await runOfferingBatch(
      offerings,
      async () => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 1));
        inFlight--;
      },
      3,
    );
    expect(peak).toBe(3);
  });

  it('resolves at once for an empty selection', async () => {
    const run = vi.fn();
    const result = await runOfferingBatch([], run);
    expect(run).not.toHaveBeenCalled();
    expect(result.succeeded).toEqual([]);
    expect(result.failed).toEqual([]);
  });
});

describe('getStateActionTargets', () => {
  const selection = [
    offering('draft', 'Draft'),
    offering('active', 'Active'),
    offering('paused', 'Paused'),
    offering('down', 'Unavailable'),
    offering('archived', 'Archived'),
  ];
  const eligible = (key: Parameters<typeof getStateActionTargets>[2]) =>
    getStateActionTargets(staff, selection, key).eligible.map(
      (item) => item.uuid,
    );

  it('matches each transition to the states it leaves', () => {
    expect(eligible('activate')).toEqual(['draft']);
    expect(eligible('pause')).toEqual(['active']);
    expect(eligible('make_unavailable')).toEqual(['active']);
    expect(eligible('unpause')).toEqual(['paused']);
    expect(eligible('make_available')).toEqual(['down']);
    expect(eligible('archive')).toEqual(['draft', 'active', 'paused', 'down']);
    expect(eligible('draft')).toEqual(['active', 'paused', 'down', 'archived']);
  });

  it('offers no transition when the deployment keeps lifecycle to staff', () => {
    const previous =
      ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT;
    ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT = false;
    try {
      expect(
        getStateActionTargets(provider, selection, 'archive').permitted,
      ).toEqual([]);
    } finally {
      ENV.plugins.WALDUR_CORE.ALLOW_SERVICE_PROVIDER_OFFERING_MANAGEMENT =
        previous;
    }
  });

  it('leaves out offerings the user holds no permission on', () => {
    vi.mocked(hasPermission).mockImplementation(
      (_user, request) => request.customerId === 'mine',
    );
    try {
      const mixed = [
        offering('mine-1', 'Active', 'mine'),
        offering('theirs', 'Active', 'theirs'),
      ];
      const targets = getStateActionTargets(staff, mixed, 'pause');
      expect(targets.permitted.map((item) => item.uuid)).toEqual(['mine-1']);
    } finally {
      vi.mocked(hasPermission).mockImplementation(() => true);
    }
  });
});

describe('getSharedCustomerUuid', () => {
  it('returns the organization all offerings belong to', () => {
    expect(
      getSharedCustomerUuid([offering('a', 'Active'), offering('b', 'Draft')]),
    ).toBe('customer-1');
  });

  it('returns null when they span several organizations', () => {
    expect(
      getSharedCustomerUuid([
        offering('a', 'Active', 'one'),
        offering('b', 'Active', 'two'),
      ]),
    ).toBeNull();
  });
});
