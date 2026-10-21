import { describe, expect, it } from 'vitest';

import {
  getAllModelsOption,
  getResourceModels,
  isAllModels,
} from './modelSelection';

const CHOICES = ['gpt-4o', 'llama-3', 'qwen'];

const offering = (managed = true, type = 'select_string_multi') =>
  ({
    plugin_options: { enable_api_key_provisioning: managed },
    resource_options: { options: { models: { type, choices: CHOICES } } },
  }) as any;

describe('isAllModels', () => {
  it('reads only a lone wildcard as every model', () => {
    expect(isAllModels(['*'])).toBe(true);
    for (const allowed of [[], ['gpt-4o'], ['*', 'gpt-4o'], null, undefined]) {
      expect(isAllModels(allowed)).toBe(false);
    }
  });
});

describe('getResourceModels', () => {
  it('narrows the offering models by the resource selection', () => {
    expect(
      getResourceModels(offering(), { options: { models: ['*'] } }),
    ).toEqual(CHOICES);
    expect(getResourceModels(offering(), { options: {} })).toEqual(CHOICES);
    expect(getResourceModels(offering(), { options: { models: '' } })).toEqual(
      CHOICES,
    );
    expect(
      getResourceModels(offering(), { options: { models: ['qwen', 'gone'] } }),
    ).toEqual(['qwen']);
    expect(getResourceModels(offering(), { options: { models: [] } })).toEqual(
      [],
    );
  });

  it('narrows nothing when the option is not a model selection', () => {
    for (const notSelection of [
      offering(false),
      offering(true, 'select_string'),
    ]) {
      expect(
        getResourceModels(notSelection, { options: { models: [] } }),
      ).toEqual(CHOICES);
    }
  });

  it('is null when the offering lists no models', () => {
    expect(getResourceModels({} as any, { options: {} })).toBeNull();
  });
});

describe('getAllModelsOption', () => {
  it('names the models option only when it is a multiple choice', () => {
    expect(getAllModelsOption(offering().resource_options)).toBe('models');
    expect(getAllModelsOption(offering(false).resource_options)).toBe('models');
    expect(
      getAllModelsOption(offering(true, 'select_string').resource_options),
    ).toBeUndefined();
  });
});
