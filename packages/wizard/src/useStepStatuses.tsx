import { ComponentType, useMemo } from 'react';
import { FieldErrorMessage } from 'waldur-form';
import type { StepNavStep } from 'waldur-ui';

/**
 * One step of a long, single-page form: its section (a `StepCard` with this
 * `id`), the component that draws it, and the form fields it owns, which is
 * how a field's error is reported against its step.
 */
export interface StepDefinition<T = StepComponentProps> {
  label: string;
  id: string;
  component: ComponentType<T>;
  params?: Record<string, any>;
  /** Field names (dotted paths) whose errors belong to this step. */
  fields?: Array<string>;
  /** Marks the step as one the reader must fill. */
  required?: boolean;
  requiredFields?: Array<string>;
  /** Whether the step applies at all, given the form's data. */
  isActive?: (data?: any) => boolean;
}

/** What each step's component is given. */
export interface StepComponentProps {
  id: string;
  title?: string;
  disabled?: boolean;
  /** Why the step is locked; shown as a notice at the top of the step. */
  disabledReason?: string;
  change?(field: string, value: any): void;
  params?: StepDefinition['params'];
}

export interface UseStepStatusesOptions {
  steps: Pick<StepDefinition, 'label' | 'id' | 'fields' | 'required'>[];
  /** Per step, in order: whether it is filled in. */
  completedSteps?: boolean[];
  /** Per step, in order: whether it is locked. */
  disabledSteps?: boolean[];
  /** The form's errors (react-final-form's `errors`), nested by field path. */
  errors?: any;
  /** Errors that block the submit whatever else holds; shown as `error`. */
  criticalErrors?: any;
  /**
   * Report "required" errors too. Off by default: an empty field the reader
   * has not reached yet is not a mistake.
   */
  showRequiredErrors?: boolean;
}

/**
 * `{ a: { z: 'z1' }, b: 'b1' }` → `{ 'a.z': 'z1', b: 'b1' }`; arrays stay
 * whole, as a field's list of messages.
 */
const flattenObject = (obj: any): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const nested = flattenObject(obj[key]);
      for (const inner in nested) {
        result[`${key}.${inner}`] = nested[inner];
      }
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

/** Field path → its messages, keeping only the ones `keep` accepts. */
const collectErrors = (
  errors: any,
  keep: (message: any) => boolean,
): Record<string, any> => {
  const flat = flattenObject(errors);
  const result: Record<string, any> = {};
  for (const key in flat) {
    const value = flat[key];
    if (!value) continue;
    if (Array.isArray(value)) {
      const kept = value.filter(keep);
      if (kept.length) result[key] = kept;
    } else if (typeof value === 'string' && keep(value)) {
      result[key] = value;
    }
  }
  return result;
};

/** A step's errors; a single field's errors collapse to its message list. */
const errorsOfStep = (fields: string[], map: Record<string, any>) => {
  const own: Record<string, any> = {};
  fields.forEach((key) => {
    if (map[key]) own[key] = map[key];
  });
  const keys = Object.keys(own);
  if (!keys.length) return null;
  return keys.length === 1 ? Object.values(own).flat().filter(Boolean) : own;
};

/**
 * Where each step of a long form stands, for `StepNav` (or
 * `getStepNavItems`): `locked` first, then `error` (a critical error),
 * `warning` (any other error but "required", unless `showRequiredErrors`),
 * `complete`, and `required` for a required step not yet filled in. An
 * error or warning carries its messages for the tooltip.
 */
export const useStepStatuses = ({
  steps,
  completedSteps = [],
  disabledSteps = [],
  errors,
  criticalErrors,
  showRequiredErrors,
}: UseStepStatusesOptions): StepNavStep[] => {
  const warningsMap = useMemo(
    () =>
      collectErrors(
        errors,
        (message) =>
          typeof message === 'string' &&
          (!message.includes('required') || Boolean(showRequiredErrors)),
      ),
    [errors, showRequiredErrors],
  );

  const criticalMap = useMemo(
    () => collectErrors(criticalErrors, () => true),
    [criticalErrors],
  );

  return useMemo(
    () =>
      steps.map((step, i): StepNavStep => {
        const base = { id: step.id, label: step.label };
        if (disabledSteps[i]) {
          return { ...base, status: 'locked' };
        }
        const critical = step.fields
          ? errorsOfStep(step.fields, criticalMap)
          : null;
        if (critical) {
          return {
            ...base,
            status: 'error',
            message: <FieldErrorMessage error={critical} />,
          };
        }
        const warning = step.fields
          ? errorsOfStep(step.fields, warningsMap)
          : null;
        if (warning) {
          return {
            ...base,
            status: 'warning',
            message: <FieldErrorMessage error={warning} />,
          };
        }
        if (completedSteps[i]) {
          return { ...base, status: 'complete' };
        }
        return step.required ? { ...base, status: 'required' } : base;
      }),
    [steps, completedSteps, disabledSteps, criticalMap, warningsMap],
  );
};
