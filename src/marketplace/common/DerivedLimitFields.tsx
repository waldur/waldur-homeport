import { OptionField } from 'waldur-js-client';

import { NumberField } from '@/form';
import { FormField } from '@/form/types';
import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { useOrderFormData } from '../deploy/selectors';

import { getComponentsByType } from './derivedLimits';

interface DerivedFieldProps extends FormField {
  field: OptionField;
}

/**
 * Component quantities the form has derived, with their units. A component
 * is named unless `hideNameOf` says the option's own label already does.
 */
const DerivedQuantities = ({
  types,
  hideNameOf,
}: {
  types: string[];
  hideNameOf?: string;
}) => {
  const { limits, offering, derivedPreview } = useOrderFormData() as any;
  // Outside the order form (a resource option dialog) there is nothing to
  // show here; the dialog previews the limits itself.
  if (!offering || derivedPreview) {
    return null;
  }
  const components = getComponentsByType(offering?.components);
  return (
    <div className="d-flex flex-column gap-1 form-text text-muted mt-2 mb-0">
      {types.map((type) => {
        const component = components[type];
        const name = component?.name || type;
        const value = limits?.[type];
        return (
          <div key={type}>
            {name === hideNameOf ? null : `${name}: `}
            <strong className="text-body">
              {renderFieldOrDash(value?.toLocaleString())}
              {value !== undefined && component?.measured_unit
                ? ` ${component.measured_unit}`
                : null}
            </strong>
          </div>
        );
      })}
    </div>
  );
};

// Unlike parseIntField and formatIntField, an empty field stays empty rather
// than becoming 0, which reads as an entered value and derives zero limits.
// Parsed as typed, so that a decimal is refused by the validator rather than
// truncated to a different value.
const parseInput = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? value : number;
};
const formatInput = (value) =>
  value === undefined || value === null ? '' : String(value);

/**
 * The value the customer enters for a `component_formula` option, followed by
 * the component quantities derived from it. The quantities are written into
 * the form's limits by `useDerivedLimits`; this field only shows them.
 */
export const ComponentFormulaField = ({
  field,
  input,
  meta,
}: DerivedFieldProps) => (
  <>
    <NumberField
      input={input}
      meta={meta}
      min={field.min}
      max={field.max}
      placeholder={translate('Enter value')}
    />
    <DerivedQuantities
      types={(field.component_formula_config?.targets || []).map(
        (target) => target.component_type,
      )}
    />
  </>
);

/** A `component_sum` option has nothing to enter; it shows the total. */
export const ComponentSumField = ({ field }: DerivedFieldProps) => {
  const target = field.component_sum_config?.target_component;
  return target ? (
    <DerivedQuantities types={[target]} hideNameOf={field.label} />
  ) : null;
};

export const componentFormulaParams = {
  parse: parseInput,
  format: formatInput,
};
