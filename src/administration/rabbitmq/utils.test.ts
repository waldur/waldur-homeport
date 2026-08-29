import { describe, expect, it } from 'vitest';

import {
  getConsumerUuid,
  getQueueKind,
  getRmqQueueType,
  isConsumerQueue,
} from './utils';

const CONSUMER_UUID = '0dc92ac0518e4604a2e27ff11120df6c';

describe('rabbitmq utils', () => {
  it('detects unified consumer queues by name', () => {
    expect(isConsumerQueue(`consumer_${CONSUMER_UUID}`)).toBe(true);
    expect(getConsumerUuid(`consumer_${CONSUMER_UUID}`)).toBe(CONSUMER_UUID);
    expect(isConsumerQueue('consumer_short')).toBe(false);
    expect(getConsumerUuid('subscription_abc_offering_def_order')).toBeNull();
  });

  it('classifies queue kind', () => {
    expect(
      getQueueKind({
        name: `consumer_${CONSUMER_UUID}`,
        subscription_uuid: null,
      }),
    ).toBe('consumer');
    expect(
      getQueueKind({
        name: 'subscription_a_offering_b_order',
        subscription_uuid: 'a',
      }),
    ).toBe('legacy');
    expect(getQueueKind({ name: 'celery', subscription_uuid: null })).toBe(
      'unknown',
    );
  });

  it('only passes through RabbitMQ x-queue-type values', () => {
    expect(getRmqQueueType({ queue_type: 'quorum' })).toBe('quorum');
    expect(getRmqQueueType({ queue_type: 'classic' })).toBe('classic');
    // The stats endpoint currently overwrites queue_type with its own
    // consumer/legacy/unknown classification.
    expect(getRmqQueueType({ queue_type: 'legacy' })).toBeNull();
    expect(getRmqQueueType({ queue_type: null })).toBeNull();
  });
});
