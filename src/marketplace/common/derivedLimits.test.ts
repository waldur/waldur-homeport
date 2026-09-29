import { describe, expect, it } from 'vitest';

import {
  computeDerivedLimits,
  evaluateFormula,
  getDerivedComponents,
  getDerivedLimitInputs,
  getFormulaError,
  getFormulaInputError,
  parseFormula,
  toRational,
} from './derivedLimits';

// Kept in step with FormulaTest in waldur-mastermind
// (marketplace/tests/test_derived_limits.py): the server recomputes every
// derived limit, so the two evaluators must agree.
const VALID: Array<[string, number, string]> = [
  ['input * 2', 200, '400'],
  ['input * 2 * 0.25', 200, '100'],
  ['(input + 10) / 4', 10, '5'],
  ['-input + 3', 1, '2'],
  ['2 - -input', 1, '3'],
  ['input * 0.1', 3, '0.3'],
  ['.5 * input', 4, '2'],
  ['  input  ', 7, '7'],
  ['1 + 2 * 3', 0, '7'],
  // Exact: floating point, or Decimal at 28 digits, is not.
  ['input * 2 / 3 * 3', 1, '2'],
];

const INVALID = [
  '',
  '   ',
  'input *',
  'input input',
  '2input',
  'inputs',
  '(input',
  'input)',
  "__import__('os')",
  'input ** 2',
  'min(input, 2)',
  'input % 2',
  '1e3',
  'x',
  '('.repeat(40) + 'input' + ')'.repeat(40),
  '1+'.repeat(200) + '1',
];

const DATABASE_OPTIONS: any = {
  storage: {
    type: 'component_formula',
    label: 'Storage',
    component_formula_config: {
      targets: [
        { component_type: 'data_primary', formula: 'input * 2' },
        { component_type: 'wal_primary', formula: 'input * 2 * 0.25' },
        { component_type: 'data_replica', formula: 'input * 2' },
        { component_type: 'wal_replica', formula: 'input * 2 * 0.25' },
      ],
    },
  },
  backup: {
    type: 'component_sum',
    label: 'Backup',
    component_sum_config: {
      target_component: 'backup',
      components: [
        'data_primary',
        'wal_primary',
        'data_replica',
        'wal_replica',
      ],
    },
  },
};

describe('formula evaluator', () => {
  it.each(VALID)(
    'evaluates %s with input %s to %s',
    (formula, input, expected) => {
      const result = evaluateFormula(parseFormula(formula), toRational(input));
      expect(result).toEqual(toRational(expected));
    },
  );

  it.each(INVALID)('rejects %j', (formula) => {
    expect(getFormulaError(formula)).toBeTruthy();
  });

  it('reports division by zero for the entered value', () => {
    const option = {
      component_formula_config: {
        targets: [{ component_type: 'cores', formula: '10 / input' }],
      },
    };
    expect(getFormulaInputError(option, 0)).toMatch(/cores/);
    expect(getFormulaInputError(option, 2)).toBeUndefined();
  });

  it('reports a negative result', () => {
    const option = {
      component_formula_config: {
        targets: [{ component_type: 'cores', formula: 'input - 10' }],
      },
    };
    expect(getFormulaInputError(option, 5)).toMatch(/negative/);
  });
});

describe('computeDerivedLimits', () => {
  it('derives the storage layout and the backup covering it', () => {
    expect(
      computeDerivedLimits(DATABASE_OPTIONS, { storage: 200 }, {}, {}),
    ).toEqual({
      data_primary: 400,
      wal_primary: 100,
      data_replica: 400,
      wal_replica: 100,
      backup: 1000,
    });
  });

  it('ignores values already in the form for derived components', () => {
    const result = computeDerivedLimits(
      DATABASE_OPTIONS,
      { storage: 200 },
      { data_primary: 1, backup: 1, extra: 5 },
      {},
    );
    expect(result.data_primary).toBe(400);
    expect(result.backup).toBe(1000);
    expect(result).not.toHaveProperty('extra');
  });

  it('clears derived components while there is no input', () => {
    expect(computeDerivedLimits(DATABASE_OPTIONS, {}, {}, {})).toEqual({
      data_primary: undefined,
      wal_primary: undefined,
      data_replica: undefined,
      wal_replica: undefined,
      backup: undefined,
    });
  });

  it('rounds up to the precision of each component', () => {
    const options: any = {
      thirds: {
        type: 'component_formula',
        component_formula_config: {
          targets: [
            { component_type: 'whole', formula: 'input / 3' },
            { component_type: 'tenths', formula: 'input / 3' },
          ],
        },
      },
    };
    expect(
      computeDerivedLimits(
        options,
        { thirds: 10 },
        {},
        { tenths: { limit_decimal_places: 1 } },
      ),
    ).toEqual({ whole: 4, tenths: 3.4 });
  });

  it('adds components the customer entered and other sums', () => {
    const options: any = {
      ...DATABASE_OPTIONS,
      // Listed before the sum it reads, to check the ordering.
      total: {
        type: 'component_sum',
        component_sum_config: {
          target_component: 'total',
          components: ['backup', 'extra'],
        },
      },
    };
    const result = computeDerivedLimits(
      options,
      { storage: 200 },
      { extra: 7 },
      {},
    );
    expect(result.total).toBe(1007);
  });

  it('uses the option default when the input is omitted', () => {
    const options = {
      ...DATABASE_OPTIONS,
      storage: { ...DATABASE_OPTIONS.storage, default: '50' },
    };
    const result = computeDerivedLimits(options, {}, {}, {});
    expect(result.data_primary).toBe(100);
    expect(result.backup).toBe(250);
  });

  it('keeps fallback values it cannot calculate, and sums them', () => {
    const options: any = {
      ...DATABASE_OPTIONS,
      backup: {
        ...DATABASE_OPTIONS.backup,
        component_sum_config: {
          target_component: 'backup',
          components: ['data_primary', 'extra'],
        },
      },
    };
    // A resource ordered before the option existed: no recorded input.
    const result = computeDerivedLimits(
      options,
      {},
      { extra: 5 },
      {},
      { data_primary: 400, backup: 401 },
    );
    expect(result.data_primary).toBe(400);
    expect(result.backup).toBe(405);
    expect(result.wal_primary).toBeUndefined();
  });

  it('takes current values only from paired resource options', () => {
    const offering: any = {
      options: { options: DATABASE_OPTIONS },
      resource_options: {
        options: { storage: { type: 'component_formula' } },
      },
    };
    const resource = {
      attributes: { storage: 200, other: 1 },
      options: { storage: 300, other: 9 },
    };
    expect(getDerivedLimitInputs(resource, offering)).toEqual({
      storage: 300,
      other: 1,
    });
    expect(
      getDerivedLimitInputs(resource, offering, { storage: 400 }).storage,
    ).toBe(400);
    // A same-named option of another type never overrides the ordered value.
    const unpaired = {
      ...offering,
      resource_options: { options: { storage: { type: 'integer' } } },
    };
    expect(getDerivedLimitInputs(resource, unpaired).storage).toBe(200);
  });

  it('lists every derived component with the option deriving it', () => {
    expect(Object.fromEntries(getDerivedComponents(DATABASE_OPTIONS))).toEqual({
      data_primary: 'storage',
      wal_primary: 'storage',
      data_replica: 'storage',
      wal_replica: 'storage',
      backup: 'backup',
    });
  });
});
