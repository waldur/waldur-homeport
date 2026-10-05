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

  it('describes the final step as pending while the order is unfinished', () => {
    // "Resource successfully created" under a step that has not run told the
    // viewer of a pending order that their resource already existed.
    expect(lastStep({ state: 'pending-consumer' }).description[0]).toBe(
      'Pending resource creation',
    );
    expect(
      lastStep({ state: 'pending-consumer', type: 'Terminate' }).description[0],
    ).toBe('Pending resource termination');
    expect(lastStep({ state: 'done' }).description[0]).toBe('Done');
  });

  it('does not invent a review time when none was recorded', () => {
    // formatDateTime(null) renders the current time, so the approval entry
    // used to carry no actor and a timestamp that moved on every reload.
    const steps = getSteps(
      buildResource({
        state: 'executing',
        consumer_reviewed_by_full_name: null,
        consumer_reviewed_at: null,
      }),
    );
    const approved = steps[1];

    expect(approved.label).toBe('Approved');
    expect(approved.description).toBeUndefined();
  });

  it('falls back to the reviewer username when there is no full name', () => {
    const steps = getSteps(
      buildResource({
        state: 'executing',
        consumer_reviewed_by_full_name: '',
        consumer_reviewed_by_username: 'jdoe',
      }),
    );

    expect(steps[1].description[0]).toMatch(/^jdoe, /);
  });

  it('does not mark provisioning as done while the project has not started', () => {
    const steps = getSteps(buildResource({ state: 'pending-project' }));
    const creation = steps.find((step) => step.label === 'Creation');

    expect(creation.completed).toBe(false);
  });
});
