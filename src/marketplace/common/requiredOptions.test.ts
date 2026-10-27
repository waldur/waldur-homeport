import { describe, expect, it } from 'vitest';

import {
  getOptionKeys,
  isEmptyOptionValue,
  missingRequiredOptions,
} from './requiredOptions';

const offeringOptions: any = {
  order: ['qos', 'partition', 'gpu_type', 'notify', 'total', 'tier'],
  options: {
    qos: { type: 'select_string', label: 'QoS', required: true },
    partition: { type: 'select_string', label: 'Partition' },
    gpu_type: {
      type: 'select_string',
      label: 'GPU type',
      required: true,
      visible_if: { field: 'partition', values: ['gpu'] },
    },
    notify: { type: 'boolean', label: 'Notify', required: true },
    total: { type: 'component_sum', label: 'Total', required: true },
    tier: {
      type: 'select_string',
      label: 'Tier',
      required: true,
      default: 'standard',
    },
  },
};

describe('missingRequiredOptions', () => {
  it('names a required option left unanswered', () => {
    expect(missingRequiredOptions(offeringOptions, {})).toEqual([
      { key: 'qos', label: 'QoS' },
    ]);
  });

  it('treats an empty answer as none', () => {
    for (const qos of ['', '   ', null, undefined]) {
      expect(missingRequiredOptions(offeringOptions, { qos })).toHaveLength(1);
    }
  });

  // The backend and a marketplace order both accept an empty multiple choice.
  it('takes an empty multiple choice as an answer', () => {
    expect(missingRequiredOptions(offeringOptions, { qos: [] })).toEqual([]);
  });

  // The backend checks every option, not only the ordered ones.
  it('checks options the order leaves out', () => {
    const unordered = {
      order: [],
      options: { qos: { type: 'select_string', label: 'QoS', required: true } },
    } as any;
    expect(missingRequiredOptions(unordered, {})).toEqual([
      { key: 'qos', label: 'QoS' },
    ]);
  });

  it('is satisfied once the option is answered', () => {
    expect(missingRequiredOptions(offeringOptions, { qos: 'long' })).toEqual(
      [],
    );
  });

  // As the backend's validate_options, and OptionsForm for booleans.
  it('skips defaults, booleans, computed and hidden options', () => {
    const missing = missingRequiredOptions(offeringOptions, {
      qos: 'long',
      partition: 'cpu',
    });
    expect(missing).toEqual([]);
  });

  it('asks for an option once its visible_if rule shows it', () => {
    expect(
      missingRequiredOptions(offeringOptions, {
        qos: 'long',
        partition: 'gpu',
      }),
    ).toEqual([{ key: 'gpu_type', label: 'GPU type' }]);
  });

  it('asks nothing of an offering without options', () => {
    expect(missingRequiredOptions(undefined, {})).toEqual([]);
    expect(missingRequiredOptions({ order: [] }, null)).toEqual([]);
  });
});

describe('getOptionKeys', () => {
  it('lists the ordered options first, then the rest', () => {
    expect(
      getOptionKeys({
        order: ['b', 'missing'],
        options: { a: {}, b: {}, c: {} },
      } as any),
    ).toEqual(['b', 'a', 'c']);
  });
});

describe('isEmptyOptionValue', () => {
  it('counts no value and blank text as empty, and nothing else', () => {
    for (const value of [undefined, null, '', ' \t\n']) {
      expect(isEmptyOptionValue(value)).toBe(true);
    }
    for (const value of [[], 0, false, 'a']) {
      expect(isEmptyOptionValue(value)).toBe(false);
    }
  });
});
