import { describe, expect, it } from 'vitest';
import { SpendingLimitUsage } from 'waldur-js-client';

import {
  headlineLimit,
  inferenceEndpoint,
  isInferenceService,
  keyName,
  mayCall,
  offeredModels,
  selectedModels,
  serviceModels,
  totalCost,
} from './services';

const limit = (fields: Partial<SpendingLimitUsage>) =>
  ({
    component_type: 'token_cost',
    period: 'month',
    limit: 10,
    used: 0,
    resets_at: null,
    reached: false,
    ...fields,
  }) as SpendingLimitUsage;

describe('inference services', () => {
  it('counts a resource with keys or the inference view as a service', () => {
    expect(
      isInferenceService({
        offering_plugin_options: { enable_api_key_provisioning: true },
      } as any),
    ).toBe(true);
    expect(
      isInferenceService({
        offering_plugin_options: { expose_inference_playground: true },
      } as any),
    ).toBe(true);
    expect(isInferenceService({ offering_plugin_options: {} } as any)).toBe(
      false,
    );
  });

  it("prefers the resource's /v1 endpoint over the offering's", () => {
    expect(
      inferenceEndpoint(
        {
          endpoints: [
            { url: 'https://docs.example' },
            { url: 'https://gw.example/v1/' },
          ],
        } as any,
        [{ url: 'https://offering.example/v1' }],
      ),
    ).toBe('https://gw.example/v1');
    expect(
      inferenceEndpoint({ endpoints: [] } as any, [
        { url: 'https://offering.example/v1' },
      ]),
    ).toBe('https://offering.example/v1');
    expect(inferenceEndpoint({ endpoints: [] } as any)).toBeNull();
  });
});

describe('models', () => {
  const offered = offeredModels({
    options: {
      models: {
        type: 'select_string_multi',
        label: 'Models',
        choices: ['a', 'b', 'c'],
      },
    },
  } as any);

  it('reads the names the offering lists', () => {
    expect(offered).toEqual(['a', 'b', 'c']);
    expect(offeredModels({ options: {} } as any)).toBeNull();
  });

  it('puts a resource that never chose on every model', () => {
    expect(selectedModels({})).toEqual(['*']);
    expect(selectedModels({ models: '' })).toEqual(['*']);
    expect(selectedModels({ models: 'a' })).toEqual(['a']);
    expect(selectedModels({ models: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it("reads the selection against the offering's list", () => {
    expect(serviceModels(offered, ['*'])).toEqual(['a', 'b', 'c']);
    expect(serviceModels(offered, ['b', 'gone'])).toEqual(['b']);
    expect(serviceModels(null, ['x'])).toEqual(['x']);
    expect(serviceModels(null, ['*'])).toBeNull();
  });

  it('lets a key call what its effective list names', () => {
    expect(mayCall({ effective_models: ['*'] } as any, 'a')).toBe(true);
    expect(mayCall({ effective_models: ['a'] } as any, 'a')).toBe(true);
    expect(mayCall({ effective_models: ['a'] } as any, 'b')).toBe(false);
    expect(mayCall({ effective_models: [] } as any, 'a')).toBe(false);
  });
});

describe('keys', () => {
  it('names a key by its note, else its backend ID', () => {
    expect(keyName({ description: ' thesis ', client_id: 'x-1' })).toBe(
      'thesis',
    );
    expect(keyName({ description: '', client_id: 'x-1' })).toBe('x-1');
    expect(keyName({ description: '', client_id: '' })).toBeUndefined();
  });

  it('puts a reached limit first, then the most used one', () => {
    const day = limit({ period: 'day', used: 4, limit: 5 });
    const month = limit({ period: 'month', used: 9, limit: 50 });
    const week = limit({ period: 'week', used: 20, limit: 20, reached: true });
    expect(headlineLimit([month, day])).toBe(day);
    expect(headlineLimit([month, day, week])).toBe(week);
    expect(headlineLimit([])).toBeUndefined();
    expect(headlineLimit(null)).toBeUndefined();
  });

  it("sums the keys' estimated cost", () => {
    expect(
      totalCost([
        { estimated_cost: '1.25' },
        { estimated_cost: null },
        { estimated_cost: '2.5' },
      ] as any),
    ).toBe(3.75);
  });
});
