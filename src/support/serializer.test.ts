import { describe, expect, it } from 'vitest';

import { serializer } from './serializer';

const makeOffering = (options): any => ({
  type: 'Support.OfferingTemplate',
  options,
});

describe('support order serializer', () => {
  it('sends the backend_id string for a single openstack tenant selection', () => {
    const offering = makeOffering({
      order: ['desired_tenant'],
      options: {
        desired_tenant: { type: 'select_openstack_tenant' },
      },
    });
    // The async select stores the whole option object (backend_id, not value).
    const attributes = {
      desired_tenant: {
        name: 'Tenant A',
        project_name: 'Project',
        backend_id: 't-1',
      },
    };

    const payload = serializer(attributes, offering);

    expect(payload.desired_tenant).toBe('t-1');
  });

  it('sends an array of backend_id strings for multiple openstack instances', () => {
    const offering = makeOffering({
      order: ['vms'],
      options: {
        vms: { type: 'select_multiple_openstack_instances' },
      },
    });
    const attributes = {
      vms: [
        { name: 'vm-a', backend_id: 'i-1' },
        { name: 'vm-b', backend_id: 'i-2' },
      ],
    };

    const payload = serializer(attributes, offering);

    expect(payload.vms).toEqual(['i-1', 'i-2']);
  });

  it('passes primitive select_string values through unchanged', () => {
    const offering = makeOffering({
      order: ['retention'],
      options: {
        retention: { type: 'select_string' },
      },
    });

    const payload = serializer({ retention: 'daily-retention-6d' }, offering);

    expect(payload.retention).toBe('daily-retention-6d');
  });

  it('falls back to the legacy value property when backend_id is absent', () => {
    const offering = makeOffering({
      order: ['desired_tenant'],
      options: { desired_tenant: { type: 'select_openstack_tenant' } },
    });

    const payload = serializer(
      { desired_tenant: { value: 'legacy-id' } },
      offering,
    );

    expect(payload.desired_tenant).toBe('legacy-id');
  });
});
