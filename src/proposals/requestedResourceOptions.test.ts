import { describe, expect, it } from 'vitest';

import {
  getMissingRequestOptions,
  getRequestOptionSummary,
  isRequestComplete,
} from './requestedResourceOptions';

const slurm = {
  offering_type: 'Marketplace.Slurm',
  components: [{ type: 'cpu_hours', name: 'CPU hours', billing_type: 'limit' }],
  options: {
    order: ['qos', 'prepaid_duration_months'],
    options: {
      qos: { type: 'select_string', label: 'QoS', required: true },
      prepaid_duration_months: { type: 'integer', label: 'Months' },
    },
  },
};

const row = (attributes: Record<string, unknown>) =>
  ({
    requested_offering: slurm,
    limits: { cpu_hours: 1000 },
    attributes,
  }) as any;

// waldur/waldur-homeport#129 on GitHub: the step was ticked green while a
// request still lacked its mandatory QoS.
describe('isRequestComplete', () => {
  it('is incomplete while a required option is unanswered', () => {
    expect(isRequestComplete(row({}))).toBe(false);
    expect(getMissingRequestOptions(row({}))).toEqual([
      { key: 'qos', label: 'QoS' },
    ]);
  });

  it('is complete once amounts and required options are given', () => {
    expect(isRequestComplete(row({ qos: 'parallel' }))).toBe(true);
  });

  it('is incomplete without an amount, whatever the options say', () => {
    expect(isRequestComplete({ ...row({ qos: 'parallel' }), limits: {} })).toBe(
      false,
    );
  });
});

describe('getRequestOptionSummary', () => {
  // The period has a column of its own.
  it('leaves the subscription period out', () => {
    expect(
      getRequestOptionSummary(
        row({ qos: 'parallel', prepaid_duration_months: 12 }),
      ),
    ).toEqual([{ key: 'qos', label: 'QoS', value: 'parallel' }]);
  });
});
