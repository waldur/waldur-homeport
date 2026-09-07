import { describe, it, expect } from 'vitest';

import { groupInvoiceItems, groupItemsByPlan } from './utils';

describe('groupInvoiceItems', () => {
  it('groups items by project_uuid and resource_uuid', () => {
    const items = [
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-1',
        resource_name: 'Resource One',
        total: '100.00',
        price: '50.00',
        details: {
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-1',
        resource_name: 'Resource One',
        total: '150.00',
        price: '75.00',
        details: {
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
    ];
    const grouped = groupInvoiceItems(items as any[]);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].project_name).toBe('Project One');
    expect(grouped[0].total).toBe(250);
    expect(grouped[0].items).toHaveLength(2);
    expect(Number(grouped[0].items[0].total)).toBe(100);
    expect(Number(grouped[0].items[0].price)).toBe(50);
    expect(Number(grouped[0].items[1].total)).toBe(150);
    expect(Number(grouped[0].items[1].price)).toBe(75);
  });

  it('groups items by resource_uuid if present, otherwise by details.resource_uuid', () => {
    const items = [
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-uuid-1',
        resource_name: 'Resource One',
        total: '50.00',
        price: '40.00',
        details: {
          offering_component_name: 'Storage',
          resource_uuid: 'resource-uuid-1',
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_name: 'Resource One',
        total: '100.00',
        price: '50.00',
        details: {
          offering_component_name: 'CPU',
          resource_uuid: 'resource-uuid-1',
          service_provider_name: 'Provider A',
          offering_name: 'Offering A',
          plan_name: 'Plan A',
        },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        details: {
          resource_uuid: 'details-resource-uuid-2',
          service_provider_name: 'Provider B',
          offering_name: 'Offering B',
          plan_name: 'Plan B',
        },
        total: '150.00',
        price: '75.00',
        name: 'Resource Two',
      },
    ];

    const grouped = groupInvoiceItems(items as any[]);

    // Expect two project-resource group
    expect(grouped).toHaveLength(2);
    expect(grouped[0].project_name).toBe('Project One');
    expect(grouped[1].project_name).toBe('Project One');

    // Verify resources are grouped by resource_uuid and details.resource_uuid
    expect(grouped[0].items).toHaveLength(2);
    expect(grouped[0].total).toBe(150);

    // First group - First resource uses resource_uuid
    expect(grouped[0].resource_uuid).toBe('resource-uuid-1');
    expect(grouped[0].resource_name).toBe('Resource One');
    expect(Number(grouped[0].items[0].total)).toBe(50);
    expect(Number(grouped[0].items[0].price)).toBe(40);

    // First group - Second resource uses details.resource_uuid
    expect(Number(grouped[0].items[1].total)).toBe(100);
    expect(Number(grouped[0].items[1].price)).toBe(50);

    // Second group - resource uses details.resource_uuid
    expect(grouped[1].resource_uuid).toBe('details-resource-uuid-2');
    expect(grouped[1].resource_name).toBe('Resource Two');
    expect(Number(grouped[1].items[0].total)).toBe(150);
    expect(Number(grouped[1].items[0].price)).toBe(75);
  });

  it('names every plan of a resource that changed plan during the month', () => {
    const items = [
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-1',
        resource_name: 'Resource One',
        start: '2026-04-10T12:00:00Z',
        total: '40.00',
        price: '40.00',
        details: { plan_name: 'Reserved' },
      },
      {
        project_uuid: 'project-1',
        project_name: 'Project One',
        resource_uuid: 'resource-1',
        resource_name: 'Resource One',
        start: '2026-04-20T12:00:00Z',
        total: '0.16',
        price: '0.16',
        details: { plan_name: 'Pay as you go' },
      },
    ];
    const grouped = groupInvoiceItems(items as any[]);
    expect(grouped[0].plan_name).toBe('Reserved → Pay as you go');
    expect(grouped[0].hasPlanChange).toBe(true);
  });

  it('keeps a single plan name when nothing changed', () => {
    const items = [
      {
        project_uuid: 'p',
        resource_uuid: 'r',
        start: '2026-04-10T12:00:00Z',
        total: '1',
        price: '1',
        details: { plan_name: 'Reserved' },
      },
    ];
    const grouped = groupInvoiceItems(items as any[]);
    expect(grouped[0].plan_name).toBe('Reserved');
    expect(grouped[0].hasPlanChange).toBeUndefined();
  });
});

describe('groupItemsByPlan', () => {
  it('splits lines by plan in billing order with period and subtotal', () => {
    const items = [
      {
        start: '2026-04-20T12:00:00Z',
        end: '2026-04-30T23:59:59Z',
        price: '0.16',
        total: '0.16',
        details: { plan_name: 'Pay as you go' },
      },
      {
        start: '2026-04-10T12:00:00Z',
        end: '2026-04-20T12:00:00Z',
        price: '20',
        total: '24',
        details: { plan_name: 'Reserved' },
      },
      {
        start: '2026-04-10T12:00:00Z',
        end: '2026-04-20T12:00:00Z',
        price: '8',
        total: '9.6',
        details: { plan_name: 'Reserved' },
      },
    ];
    const groups = groupItemsByPlan(items as any[]);
    expect(groups.map((g) => g.plan_name)).toEqual([
      'Reserved',
      'Pay as you go',
    ]);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[0].price).toBe(28);
    expect(groups[0].total).toBe(33.6);
    expect(groups[0].start).toBe('2026-04-10T12:00:00Z');
    expect(groups[0].end).toBe('2026-04-20T12:00:00Z');
  });

  it('keeps discounts and compensations with the line they adjust', () => {
    const items = [
      {
        uuid: 'reserved-cores',
        start: '2026-04-01T00:00:00Z',
        end: '2026-04-10T12:00:00Z',
        price: '20',
        total: '20',
        details: { plan_name: 'Reserved' },
      },
      {
        uuid: 'reserved-discount',
        start: '2026-04-01T00:00:00Z',
        end: '2026-04-10T12:00:00Z',
        price: '-2',
        total: '-2',
        details: { is_discount: true, discount_of_item: 'reserved-cores' },
      },
      {
        uuid: 'usage-cores',
        start: '2026-04-10T12:00:00Z',
        end: '2026-04-30T23:59:59Z',
        price: '5',
        total: '5',
        details: { plan_name: 'Pay as you go' },
      },
      {
        uuid: 'usage-compensation',
        start: '2026-04-10T12:00:00Z',
        end: '2026-04-30T23:59:59Z',
        price: '-1',
        total: '-1',
        credit: 'credit-uuid',
        details: {
          is_compensation: true,
          compensation_of_item: 'usage-cores',
          plan_name: 'Pay as you go',
        },
      },
      {
        uuid: 'orphan',
        start: '2026-04-01T00:00:00Z',
        end: '2026-04-30T23:59:59Z',
        price: '3',
        total: '3',
        details: {},
      },
    ];
    const groups = groupItemsByPlan(items as any[]);
    expect(groups.map((g) => g.plan_name)).toEqual([
      'Reserved',
      'Pay as you go',
      '',
    ]);
    expect(groups[0].items.map((i) => i.uuid)).toEqual([
      'reserved-cores',
      'reserved-discount',
    ]);
    expect(groups[0].price).toBe(18);
    expect(groups[1].items.map((i) => i.uuid)).toEqual([
      'usage-cores',
      'usage-compensation',
    ]);
    expect(groups[1].price).toBe(4);
    expect(groups[2].items.map((i) => i.uuid)).toEqual(['orphan']);
  });
});
