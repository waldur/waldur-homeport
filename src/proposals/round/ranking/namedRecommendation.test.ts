import { describe, expect, it } from 'vitest';

import { getNamedRecommendation } from './rankings';

describe('getNamedRecommendation', () => {
  it('names the offering and its components, with their units', () => {
    expect(
      getNamedRecommendation({
        recommended_resources: { o1: { cpu_hours: 400000, storage: 2000 } },
        recommended_resources_detail: [
          {
            requested_offering_uuid: 'o1',
            offering_name: 'Cluster partition',
            components: [
              {
                type: 'cpu_hours',
                name: 'CPU hours',
                measured_unit: 'h',
                amount: 400000,
              },
              {
                type: 'storage',
                name: 'Storage',
                measured_unit: '',
                amount: 2000,
              },
            ],
          },
        ],
      } as any),
    ).toEqual([
      {
        uuid: 'o1',
        offering: 'Cluster partition',
        amounts: 'CPU hours 400000 h, Storage 2000',
      },
    ]);
  });

  it('falls back to the raw keys without names', () => {
    expect(
      getNamedRecommendation({
        recommended_resources: { o1: { cpu: 80 } },
      } as any),
    ).toEqual([{ uuid: 'o1', amounts: 'cpu 80' }]);
  });
});
