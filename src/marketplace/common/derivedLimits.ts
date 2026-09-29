import { OptionField } from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * Component limits derived from order-form options. This mirrors
 * `marketplace/derived_limits.py` in waldur-mastermind, which recomputes the
 * same values when the order is submitted and keeps its own; the form computes
 * them so the customer sees the quantities and the price before submitting.
 *
 * - `component_formula` sets each of its targets to a formula over the value
 *   the customer enters;
 * - `component_sum` sets its target to the sum of other limit components.
 *
 * Arithmetic is exact (fractions of BigInts), as on the server, so a result
 * never lands a hair above a whole number and rounds up to the next one.
 */

const FORMULA_TYPE = 'component_formula';
const SUM_TYPE = 'component_sum';

const MAX_FORMULA_LENGTH = 255;
const MAX_FORMULA_DEPTH = 32;

type OptionsMap = Record<string, Partial<OptionField> | null | undefined>;

interface LimitPrecision {
  limit_decimal_places?: number | null;
}

class FormulaError extends Error {}

/** An exact rational number; the denominator is always positive. */
interface Rational {
  n: bigint;
  d: bigint;
}

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);

const gcd = (a: bigint, b: bigint): bigint => {
  a = a < ZERO ? -a : a;
  b = b < ZERO ? -b : b;
  while (b !== ZERO) {
    [a, b] = [b, a % b];
  }
  return a;
};

const rational = (n: bigint, d: bigint = ONE): Rational => {
  if (d < ZERO) {
    n = -n;
    d = -d;
  }
  const divisor = gcd(n, d) || ONE;
  return { n: n / divisor, d: d / divisor };
};

const add = (a: Rational, b: Rational) =>
  rational(a.n * b.d + b.n * a.d, a.d * b.d);
const subtract = (a: Rational, b: Rational) =>
  rational(a.n * b.d - b.n * a.d, a.d * b.d);
const multiply = (a: Rational, b: Rational) => rational(a.n * b.n, a.d * b.d);
const divide = (a: Rational, b: Rational) => {
  if (b.n === ZERO) {
    throw new FormulaError(translate('Division by zero.'));
  }
  return rational(a.n * b.d, a.d * b.n);
};

const pow10 = (exponent: number) => TEN ** BigInt(exponent);

/** Parses a decimal string such as "0.25", "3" or "1e-3" exactly. */
const parseDecimal = (text: string): Rational => {
  const match = /^(-?)(\d*)(?:\.(\d+))?(?:e([-+]?\d+))?$/i.exec(text.trim());
  if (!match || (match[2] === '' && match[3] === undefined)) {
    throw new FormulaError(translate('Invalid number.'));
  }
  const [, sign, whole, fraction = '', exponentText] = match;
  let n = BigInt((whole || '0') + fraction);
  let d = pow10(fraction.length);
  const exponent = Number(exponentText || 0);
  if (exponent > 0) {
    n *= pow10(exponent);
  } else if (exponent < 0) {
    d *= pow10(-exponent);
  }
  return rational(sign ? -n : n, d);
};

export const toRational = (value: number | string): Rational =>
  parseDecimal(String(value));

const toNumber = (value: Rational) =>
  value.d === ONE ? Number(value.n) : Number(value.n) / Number(value.d);

/** Rounds up to `places` decimal places, as the server does. */
const roundUp = (value: Rational, places: number): Rational => {
  const scale = pow10(places);
  const scaled = value.n * scale;
  let quotient = scaled / value.d;
  if (scaled % value.d !== ZERO && scaled > ZERO) {
    quotient += ONE;
  }
  return rational(quotient, scale);
};

type Token = { kind: string; value?: Rational };

type FormulaNode =
  | { kind: 'num'; value: Rational }
  | { kind: 'input' }
  | { kind: 'neg'; operand: FormulaNode }
  | { kind: '+' | '-' | '*' | '/'; left: FormulaNode; right: FormulaNode };

const tokenize = (text: string): Token[] => {
  const pattern = /\s*(?:([0-9]+(?:\.[0-9]+)?|\.[0-9]+)|(input)\b|([-+*/()]))/y;
  const tokens: Token[] = [];
  const source = text.trimEnd();
  let position = 0;
  while (position < source.length) {
    pattern.lastIndex = position;
    const match = pattern.exec(source);
    if (!match) {
      throw new FormulaError(
        translate('Unexpected character {char} at position {position}.', {
          char: JSON.stringify(source.slice(position).trimStart().charAt(0)),
          position: position + 1,
        }),
      );
    }
    const [, number, name, operator] = match;
    if (number !== undefined) {
      tokens.push({ kind: 'num', value: parseDecimal(number) });
    } else if (name !== undefined) {
      tokens.push({ kind: 'input' });
    } else {
      tokens.push({ kind: operator });
    }
    position = pattern.lastIndex;
  }
  return tokens;
};

/**
 * Recursive descent over expr := term (('+'|'-') term)*,
 * term := unary (('*'|'/') unary)*, unary := ('+'|'-') unary | primary,
 * primary := number | 'input' | '(' expr ')'.
 */
const parseTokens = (tokens: Token[]): FormulaNode => {
  let position = 0;
  let depth = 0;
  const peek = () => tokens[position]?.kind;
  const take = () => tokens[position++];
  const unexpected = (kind: string) =>
    new FormulaError(translate('Unexpected {token}.', { token: `'${kind}'` }));

  const nested = <T>(rule: () => T): T => {
    depth += 1;
    if (depth > MAX_FORMULA_DEPTH) {
      throw new FormulaError(translate('Formula is nested too deeply.'));
    }
    try {
      return rule();
    } finally {
      depth -= 1;
    }
  };

  const primary = (): FormulaNode => {
    const kind = peek();
    if (kind === 'num') {
      return { kind: 'num', value: take().value };
    }
    if (kind === 'input') {
      take();
      return { kind: 'input' };
    }
    if (kind === '(') {
      take();
      const node = nested(expr);
      if (peek() !== ')') {
        throw new FormulaError(translate('Missing closing parenthesis.'));
      }
      take();
      return node;
    }
    if (kind === undefined) {
      throw new FormulaError(translate('Formula ends unexpectedly.'));
    }
    throw unexpected(kind);
  };

  const unary = (): FormulaNode => {
    const kind = peek();
    if (kind === '+' || kind === '-') {
      take();
      const operand = nested(unary);
      return kind === '-' ? { kind: 'neg', operand } : operand;
    }
    return primary();
  };

  const term = (): FormulaNode => {
    let node = unary();
    while (peek() === '*' || peek() === '/') {
      const kind = take().kind as '*' | '/';
      node = { kind, left: node, right: unary() };
    }
    return node;
  };

  function expr(): FormulaNode {
    let node = term();
    while (peek() === '+' || peek() === '-') {
      const kind = take().kind as '+' | '-';
      node = { kind, left: node, right: term() };
    }
    return node;
  }

  if (tokens.length === 0) {
    throw new FormulaError(translate('Formula is empty.'));
  }
  const node = expr();
  if (peek() !== undefined) {
    throw unexpected(peek());
  }
  return node;
};

export const parseFormula = (text: string): FormulaNode => {
  if (typeof text !== 'string') {
    throw new FormulaError(translate('Formula must be a string.'));
  }
  if (text.length > MAX_FORMULA_LENGTH) {
    throw new FormulaError(
      translate('Formula is longer than {max} characters.', {
        max: MAX_FORMULA_LENGTH,
      }),
    );
  }
  return parseTokens(tokenize(text));
};

export const evaluateFormula = (
  node: FormulaNode,
  value: Rational,
): Rational => {
  switch (node.kind) {
    case 'num':
      return node.value;
    case 'input':
      return value;
    case 'neg':
      return multiply(rational(-ONE), evaluateFormula(node.operand, value));
    case '+':
      return add(
        evaluateFormula(node.left, value),
        evaluateFormula(node.right, value),
      );
    case '-':
      return subtract(
        evaluateFormula(node.left, value),
        evaluateFormula(node.right, value),
      );
    case '*':
      return multiply(
        evaluateFormula(node.left, value),
        evaluateFormula(node.right, value),
      );
    case '/':
      return divide(
        evaluateFormula(node.left, value),
        evaluateFormula(node.right, value),
      );
  }
};

/** Returns the error message of a formula, or undefined when it is valid. */
export const getFormulaError = (text: string): string | undefined => {
  try {
    parseFormula(text);
    return undefined;
  } catch (error) {
    if (error instanceof FormulaError) {
      return error.message;
    }
    throw error;
  }
};

const getFormulaTargets = (option: Partial<OptionField>) =>
  option.component_formula_config?.targets || [];

/** Maps each derived component type to the name of the option deriving it. */
export const getDerivedComponents = (
  options: OptionsMap | undefined,
): Map<string, string> => {
  const result = new Map<string, string>();
  Object.entries(options || {}).forEach(([name, option]) => {
    if (option?.type === FORMULA_TYPE) {
      getFormulaTargets(option).forEach(({ component_type }) => {
        if (!result.has(component_type)) result.set(component_type, name);
      });
    } else if (option?.type === SUM_TYPE) {
      const target = option.component_sum_config?.target_component;
      if (target && !result.has(target)) result.set(target, name);
    }
  });
  return result;
};

/** (target, components) of each sum, after the sums it reads. */
const getSumOrder = (options: OptionsMap): Array<[string, string[]]> => {
  const sums = new Map<string, string[]>();
  Object.values(options).forEach((option) => {
    if (option?.type === SUM_TYPE && option.component_sum_config) {
      sums.set(
        option.component_sum_config.target_component,
        option.component_sum_config.components || [],
      );
    }
  });
  const ordered: Array<[string, string[]]> = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const visit = (target: string) => {
    if (state.get(target) === 'done') return;
    if (state.get(target) === 'visiting') {
      // The server refuses such offerings; skip rather than loop.
      return;
    }
    state.set(target, 'visiting');
    sums.get(target).forEach((component) => {
      if (sums.has(component)) visit(component);
    });
    state.set(target, 'done');
    ordered.push([target, sums.get(target)]);
  };
  sums.forEach((_, target) => visit(target));
  return ordered;
};

const isEmpty = (value: unknown) =>
  value === undefined || value === null || value === '';

/**
 * Evaluates a formula option for one input value. Returns the error message
 * the server would give, so the field can show it before submitting.
 */
export const getFormulaInputError = (
  option: Partial<OptionField>,
  value: unknown,
): string | undefined => {
  if (isEmpty(value) || !Number.isFinite(Number(value))) {
    return undefined;
  }
  const input = toRational(Number(value));
  for (const { component_type, formula } of getFormulaTargets(option)) {
    try {
      const amount = evaluateFormula(parseFormula(formula), input);
      if (amount.n < ZERO) {
        return translate('Calculated {component} is negative.', {
          component: component_type,
        });
      }
    } catch (error) {
      if (error instanceof FormulaError) {
        return translate('Cannot calculate {component}: {error}', {
          component: component_type,
          error: error.message,
        });
      }
      throw error;
    }
  }
  return undefined;
};

interface OfferingWithOptions {
  options?: { options?: OptionsMap } | null;
  resource_options?: { options?: OptionsMap } | null;
  components?: ReadonlyArray<{ type: string }>;
}

/** An offering's components keyed by type. */
export const getComponentsByType = (
  components?: ReadonlyArray<any> | null,
): Record<string, any> =>
  Object.fromEntries(
    (components || []).map((component) => [component.type, component]),
  );

/**
 * Names of resource options that change a formula input after ordering: a
 * Component Formula resource option paired with the order option of the same
 * name. Mirrors `paired_resource_options` in waldur-mastermind.
 */
export const getPairedFormulaKeys = (
  offering?: OfferingWithOptions,
): string[] =>
  Object.entries(offering?.resource_options?.options || {})
    .filter(
      ([key, option]) =>
        option?.type === FORMULA_TYPE &&
        offering?.options?.options?.[key]?.type === FORMULA_TYPE,
    )
    .map(([key]) => key);

/**
 * The inputs a resource's derived limits are calculated from, as the server
 * does (`derived_limit_inputs`): the ordered values, overridden by a paired
 * resource option's current value and then by `newOptions`. Other resource
 * options never override them, even with the same name.
 */
export const getDerivedLimitInputs = (
  resource: { attributes?: unknown; options?: unknown } | undefined,
  offering: OfferingWithOptions | undefined,
  newOptions?: Record<string, unknown>,
): Record<string, unknown> => {
  const inputs = {
    ...((resource?.attributes as Record<string, unknown>) || {}),
  };
  const paired = getPairedFormulaKeys(offering);
  for (const options of [
    (resource?.options as Record<string, unknown>) || {},
    newOptions || {},
  ]) {
    paired
      .filter((key) => key in options)
      .forEach((key) => {
        inputs[key] = options[key];
      });
  }
  return inputs;
};

interface ComponentBounds {
  name?: string;
  min_value?: number | string | null;
  max_value?: number | string | null;
}

/**
 * Why the limits derived from these values would be refused: the server checks
 * every derived limit against its component's bounds, on a row the customer
 * cannot edit, so the input they come from has to say so.
 */
export const getDerivedLimitBoundsError = (
  options: OptionsMap | undefined,
  attributes: Record<string, unknown> | undefined,
  limits: Record<string, unknown> | undefined,
  components: Record<string, (LimitPrecision & ComponentBounds) | undefined>,
  fallback?: Record<string, unknown>,
): string | undefined => {
  const derived = computeDerivedLimits(
    options,
    attributes,
    limits,
    components,
    fallback,
  );
  for (const [type, value] of Object.entries(derived)) {
    const component = components[type];
    if (value === undefined || !component) continue;
    const name = component.name || type;
    // As the server: 0 or empty means no maximum, a set minimum applies.
    const max = Number(component.max_value);
    if (component.max_value && value > max) {
      return translate(
        'Calculated {component} ({value}) is above its maximum of {max}.',
        {
          component: name,
          value,
          max,
        },
      );
    }
    const min = Number(component.min_value);
    if (
      component.min_value != null &&
      component.min_value !== '' &&
      value < min
    ) {
      return translate(
        'Calculated {component} ({value}) is below its minimum of {min}.',
        {
          component: name,
          value,
          min,
        },
      );
    }
  }
  return undefined;
};

/** The entered value of a formula option, falling back to its default. */
const getFormulaInput = (
  option: Partial<OptionField>,
  attributes: Record<string, unknown> | undefined,
  name: string,
) => {
  const value = attributes?.[name];
  return isEmpty(value) ? option.default : value;
};

/**
 * The value of every derived component, given the option values and limits.
 * A derived component that cannot be calculated -- its input is empty,
 * hidden or invalid -- maps to undefined, since the server would not set it
 * either, unless `fallback` holds a value for it: for an existing resource the
 * server keeps its current limit in that case.
 */
export const computeDerivedLimits = (
  options: OptionsMap | undefined,
  attributes: Record<string, unknown> | undefined,
  limits: Record<string, unknown> | undefined,
  components: Record<string, LimitPrecision | undefined>,
  fallback?: Record<string, unknown>,
): Record<string, number | undefined> => {
  const derived = getDerivedComponents(options);
  const result: Record<string, number | undefined> = {};
  if (derived.size === 0) {
    return result;
  }
  const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);
  const exact = new Map<string, Rational>();
  Object.entries(limits || {}).forEach(([key, value]) => {
    if (!derived.has(key) && isNumber(value)) {
      exact.set(key, toRational(value));
    }
  });
  const places = (type: string) => components[type]?.limit_decimal_places || 0;

  Object.entries(options).forEach(([name, option]) => {
    if (option?.type !== FORMULA_TYPE) return;
    const value = getFormulaInput(option, attributes, name);
    if (isEmpty(value) || !Number.isFinite(Number(value))) return;
    if (getFormulaInputError(option, value)) return;
    const input = toRational(Number(value));
    getFormulaTargets(option).forEach(({ component_type, formula }) => {
      const amount = evaluateFormula(parseFormula(formula), input);
      exact.set(component_type, roundUp(amount, places(component_type)));
    });
  });

  // Before the sums, so that a sum over a kept value adds it in.
  derived.forEach((_, type) => {
    if (!exact.has(type) && isNumber(fallback?.[type])) {
      exact.set(type, toRational(fallback[type] as number));
    }
  });

  getSumOrder(options).forEach(([target, sources]) => {
    const present = sources.filter((source) => exact.has(source));
    if (present.length === 0) return;
    const total = present.reduce(
      (sum, source) => add(sum, exact.get(source)),
      rational(ZERO),
    );
    exact.set(target, roundUp(total, places(target)));
  });

  derived.forEach((_, type) => {
    result[type] = exact.has(type) ? toNumber(exact.get(type)) : undefined;
  });
  return result;
};
