import { describe, expect, it } from 'vitest';

import { formatOptionSummary, summarizeOptionValues } from './optionSummary';

const offeringOptions: any = {
  order: ['qos', 'partition', 'gpu_type'],
  options: {
    qos: { type: 'select_string', label: 'QoS' },
    partition: { type: 'select_string', label: 'Partition' },
    gpu_type: {
      type: 'select_string',
      label: 'GPU type',
      visible_if: { field: 'partition', values: ['gpu'] },
    },
  },
};

describe('summarizeOptionValues', () => {
  it('lists the answered options in the offering order', () => {
    const items = summarizeOptionValues(offeringOptions, {
      partition: 'cpu',
      qos: 'parallel',
      gpu_type: 'a100',
    });
    // gpu_type is hidden while the partition is not gpu.
    expect(formatOptionSummary(items)).toBe('QoS: parallel · Partition: cpu');
  });

  it('leaves out unanswered options', () => {
    expect(summarizeOptionValues(offeringOptions, { qos: '' })).toEqual([]);
    expect(summarizeOptionValues(undefined, { qos: 'parallel' })).toEqual([]);
  });
});
