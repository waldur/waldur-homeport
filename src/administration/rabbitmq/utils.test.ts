import { describe, expect, it } from 'vitest';

import { getConsumerQueueName } from './utils';

const CONSUMER_UUID = '0dc92ac0518e4604a2e27ff11120df6c';

describe('rabbitmq utils', () => {
  it('builds the queue name of a consumer, dashed or not', () => {
    expect(getConsumerQueueName(CONSUMER_UUID)).toBe(
      `consumer_${CONSUMER_UUID}`,
    );
    expect(getConsumerQueueName('0dc92ac0-518e-4604-a2e2-7ff11120df6c')).toBe(
      `consumer_${CONSUMER_UUID}`,
    );
  });
});
