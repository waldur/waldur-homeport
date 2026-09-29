import { describe, expect, it } from 'vitest';

import { getOptionTypes } from './OptionTypeGroup';

const typesOf = (resourceType, offering) =>
  getOptionTypes(resourceType, offering).map((type) => type.value);

const withFormula = {
  options: {
    options: {
      storage: { type: 'component_formula', label: 'Storage' },
    },
  },
};

describe('getOptionTypes', () => {
  it('offers every type for order options', () => {
    const types = typesOf('options', {});
    expect(types).toContain('component_formula');
    expect(types).toContain('component_sum');
  });

  it('never offers a sum for resource options', () => {
    expect(typesOf('resource_options', withFormula)).not.toContain(
      'component_sum',
    );
  });

  it('offers a resource formula only to pair with a formula order option', () => {
    expect(typesOf('resource_options', {})).not.toContain('component_formula');
    expect(typesOf('resource_options', withFormula)).toContain(
      'component_formula',
    );
  });

  it('describes the resource formula by its pairing', () => {
    const formula = getOptionTypes('resource_options', withFormula).find(
      (type) => type.value === 'component_formula',
    );
    expect(formula.description).toMatch(/after ordering/);
  });
});
