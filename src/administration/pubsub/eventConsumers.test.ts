import { describe, expect, it } from 'vitest';

import {
  canResync,
  getConsumerStatus,
  getWebhookHost,
  summarizeObjectTypes,
} from './eventConsumers';

const webhook = (fields = {}) =>
  ({
    delivery: 'webhook',
    delivery_blocked_reason: null,
    last_delivered_at: null,
    last_error: '',
    last_error_at: null,
    ...fields,
  }) as any;

const queue = (fields = {}) =>
  ({
    delivery: 'rmq',
    delivery_blocked_reason: null,
    queue_created: true,
    ...fields,
  }) as any;

describe('getConsumerStatus', () => {
  it('reports a blocked consumer before anything else', () => {
    const status = getConsumerStatus(
      webhook({ delivery_blocked_reason: 'Owner account is deactivated.' }),
      undefined,
    );
    expect(status.label).toBe('Blocked');
    expect(status.tooltip).toBe('Owner account is deactivated.');
  });

  it('is failing when the last error is newer than the last delivery', () => {
    const status = getConsumerStatus(
      webhook({
        last_delivered_at: '2026-10-16T10:00:00Z',
        last_error: 'Listener answered HTTP 503.',
        last_error_at: '2026-10-16T11:00:00Z',
      }),
      undefined,
    );
    expect(status.label).toBe('Failing');
    expect(status.variant).toBe('danger');
  });

  it('is failing when a batch delivered some messages and then failed', () => {
    const at = '2026-10-16T11:00:00Z';
    const status = getConsumerStatus(
      webhook({ last_delivered_at: at, last_error_at: at, last_error: 'x' }),
      undefined,
    );
    expect(status.label).toBe('Failing');
  });

  it('is delivering again once a delivery succeeds after an error', () => {
    const status = getConsumerStatus(
      webhook({
        last_delivered_at: '2026-10-16T12:00:00Z',
        last_error_at: '2026-10-16T11:00:00Z',
      }),
      undefined,
    );
    expect(status.label).toBe('Delivering');
  });

  it('is waiting before the first delivery', () => {
    expect(getConsumerStatus(webhook(), undefined).label).toBe('Waiting');
  });

  it('reads queue state from RabbitMQ statistics', () => {
    expect(
      getConsumerStatus(queue({ queue_created: false }), undefined).label,
    ).toBe('Pending');
    expect(getConsumerStatus(queue(), undefined).label).toBe('Ready');
    expect(
      getConsumerStatus(queue(), { messages: 0, consumers: 2 }).label,
    ).toBe('Connected');
    expect(
      getConsumerStatus(queue(), { messages: 5, consumers: 0 }).label,
    ).toBe('Disconnected');
  });
});

describe('formatting helpers', () => {
  it('summarizes object types', () => {
    expect(summarizeObjectTypes([])).toBe('All event types');
    expect(summarizeObjectTypes(['user_role'])).toBe('Role changes');
    expect(summarizeObjectTypes(['order', 'resource'])).toBe('2 event types');
  });

  it('strips scheme and ellipsis from a webhook destination', () => {
    expect(getWebhookHost('https://itsm.example.com:8443/…')).toBe(
      'itsm.example.com:8443',
    );
    expect(getWebhookHost(null)).toBeNull();
  });
});

describe('canResync', () => {
  it('needs a global consumer that receives role changes', () => {
    const row = (fields) =>
      ({ is_global: true, object_types: [], ...fields }) as any;
    expect(canResync(row({}))).toBe(true);
    expect(canResync(row({ object_types: ['user_role'] }))).toBe(true);
    expect(canResync(row({ object_types: ['order'] }))).toBe(false);
    expect(canResync(row({ is_global: false }))).toBe(false);
  });
});
