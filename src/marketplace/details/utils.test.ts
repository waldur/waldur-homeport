import { describe, expect, it } from 'vitest';

import { formatOrderForCreate } from './utils';

// Use an offering type that is not in the registry so the identity form
// serializer is used and formatAttributes performs the normalization itself.
const makeOffering = (options): any => ({
  type: 'Custom.Unregistered',
  url: 'https://example.com/api/marketplace-offerings/1/',
  options,
});

describe('formatOrderForCreate attributes normalization', () => {
  it('extracts backend_id from a single openstack tenant option object', () => {
    const offering = makeOffering({
      order: ['desired_tenant'],
      options: { desired_tenant: { type: 'select_openstack_tenant' } },
    });

    const body = formatOrderForCreate(offering, {
      attributes: {
        desired_tenant: {
          name: 'Tenant A',
          project_name: 'Project',
          backend_id: 't-1',
        },
      },
    } as any);

    expect((body.attributes as any).desired_tenant).toBe('t-1');
  });

  it('maps an array of instance option objects to backend_id strings', () => {
    const offering = makeOffering({
      order: ['vms'],
      options: { vms: { type: 'select_multiple_openstack_instances' } },
    });

    const body = formatOrderForCreate(offering, {
      attributes: {
        vms: [
          { name: 'vm-a', backend_id: 'i-1' },
          { name: 'vm-b', backend_id: 'i-2' },
        ],
      },
    } as any);

    expect((body.attributes as any).vms).toEqual(['i-1', 'i-2']);
  });
});
