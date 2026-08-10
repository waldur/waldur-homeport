import { describe, expect, it } from 'vitest';

import { getSteps } from './OrderInProgressView';

const buildResource = (order: Record<string, any>) =>
  ({
    order_in_progress: {
      uuid: 'order-uuid',
      type: 'Create',
      created_by_full_name: 'Maria Grazia Giuffreda',
      created: '2026-08-06T13:14:32Z',
      consumer_reviewed_by_full_name: 'Maria Grazia Giuffreda',
      consumer_reviewed_at: '2026-08-06T13:14:32Z',
      provider_reviewed_at: null,
      start_date: null,
      ...order,
    },
    creation_order: { start_date: order.start_date ?? null },
  }) as any;

const lastStep = (order: Record<string, any>) => {
  const steps = getSteps(buildResource(order));
  return steps[steps.length - 1];
};

describe('getSteps', () => {
  it('marks the final step as danger only for a failed order', () => {
    expect(lastStep({ state: 'erred' }).variant).toBe('danger');
    expect(lastStep({ state: 'canceled' }).variant).toBe('danger');
    expect(lastStep({ state: 'rejected' }).variant).toBe('danger');
  });

  it('keeps the final step neutral while the order is still in progress', () => {
    // A waiting order is not a failed one — painting it red made healthy
    // scheduled orders look broken.
    expect(lastStep({ state: 'pending-project' }).variant).toBe('primary');
    expect(lastStep({ state: 'pending-start-date' }).variant).toBe('primary');
    expect(lastStep({ state: 'executing' }).variant).toBe('primary');
    expect(lastStep({ state: 'done' }).variant).toBe('primary');
  });

  it('adds a waiting step for an order held until the project starts', () => {
    const steps = getSteps(
      buildResource({ state: 'pending-project', start_date: '2026-11-01' }),
    );
    const waiting = steps.find(
      (step) => step.label === 'Pending project start',
    ) as any;

    expect(waiting).toBeDefined();
    expect(waiting.completed).toBe(false);
    expect(waiting.description[0]).toBe('Scheduled to start on: 1 Nov 2026');
  });

  it('falls back to a generic hint when the order has no start date', () => {
    const steps = getSteps(buildResource({ state: 'pending-project' }));
    const waiting = steps.find(
      (step) => step.label === 'Pending project start',
    ) as any;

    expect(waiting.description[0]).toBe('Waiting for the project to start');
  });

  it('does not mark provisioning as done while the project has not started', () => {
    const steps = getSteps(buildResource({ state: 'pending-project' }));
    const creation = steps.find((step) => step.label === 'Creation');

    expect(creation.completed).toBe(false);
  });
});
