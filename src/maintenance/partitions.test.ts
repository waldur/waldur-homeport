import { describe, expect, it } from 'vitest';

import { getMaintenanceOfferingFormFields, parsePartitions } from './utils';

describe('affected partitions', () => {
  it('parses a comma or space separated list; blank means all', () => {
    expect(parsePartitions('batch, gpu  debug')).toEqual([
      'batch',
      'gpu',
      'debug',
    ]);
    expect(parsePartitions('')).toEqual([]);
    expect(parsePartitions(undefined)).toEqual([]);
  });

  it('fills the form from an affected offering', () => {
    const fields = getMaintenanceOfferingFormFields([
      {
        offering: 'http://example.com/api/marketplace-provider-offerings/abc/',
        impact_level: 3,
        impact_description: 'GPU nodes down',
        affected_partitions: ['gpu'],
      },
    ]);
    expect(fields.affected_partitions).toEqual({ abc: 'gpu' });
  });
});
