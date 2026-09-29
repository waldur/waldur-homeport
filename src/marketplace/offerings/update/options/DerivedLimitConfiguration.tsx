import { PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { PublicOfferingDetails } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { composeValidators, required, requiredArray } from '@/core/validators';
import { FormGroup, NumberGroup, SelectGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { getFormulaError } from '@/marketplace/common/derivedLimits';

import { getLimitComponentOptions } from './limitComponentOptions';

interface DerivedLimitConfigurationProps {
  offering?: PublicOfferingDetails;
}

const validateFormula = composeValidators(required, getFormulaError);

/** Settings of a `component_formula` option: bounds and target formulas. */
export const ComponentFormulaConfiguration = ({
  offering,
}: DerivedLimitConfigurationProps) => {
  const componentOptions = getLimitComponentOptions(offering);
  const name = 'component_formula_config.targets';
  return (
    <>
      <NumberGroup
        label={translate('Minimal value')}
        description={translate('Smallest value the customer may enter.')}
        name="min"
        type="number"
      />
      <NumberGroup
        label={translate('Maximal value')}
        description={translate('Largest value the customer may enter.')}
        name="max"
        type="number"
      />
      <FormGroup
        label={translate('Calculated components')}
        description={translate(
          'Each component is set to its formula. A formula may use input (the value entered), numbers, + - * / and parentheses, for example input * 2 * 0.25. Results are rounded up to the precision of the component.',
        )}
        required
      >
        <FieldArray name={name} validate={requiredArray}>
          {({ fields }) => (
            <div className="d-flex flex-column gap-3">
              {fields.map((field, index) => (
                // A fixed grid, so that the columns line up whatever each
                // row's selected component is called.
                <div key={field} className="row g-2 align-items-start">
                  <div className="col-6">
                    <SelectGroup
                      name={`${field}.component_type`}
                      label={translate('Component')}
                      validate={required}
                      options={componentOptions}
                      isClearable={false}
                      placeholder={translate('Select component')}
                      simpleValue
                    />
                  </div>
                  <div className="col">
                    <StringGroup
                      name={`${field}.formula`}
                      label={translate('Formula')}
                      validate={validateFormula}
                      placeholder="input * 2"
                    />
                  </div>
                  <div className="col-auto">
                    <BaseButton
                      variant="danger"
                      onClick={() => fields.remove(index)}
                      iconNode={<TrashIcon weight="bold" />}
                      tooltip={translate('Remove component')}
                      size="sm"
                      className="mt-8"
                    />
                  </div>
                </div>
              ))}
              <BaseButton
                variant="secondary"
                size="sm"
                className="align-self-start"
                onClick={() =>
                  fields.push({ component_type: null, formula: 'input' })
                }
                iconNode={<PlusIcon className="me-1" weight="bold" />}
                label={translate('Add component')}
              />
            </div>
          )}
        </FieldArray>
      </FormGroup>
    </>
  );
};

/** Settings of a `component_sum` option: the total and what it adds up. */
export const ComponentSumConfiguration = ({
  offering,
}: DerivedLimitConfigurationProps) => {
  const componentOptions = getLimitComponentOptions(offering);
  const { values } = useFormState({ subscription: { values: true } });
  const target = values.component_sum_config?.target_component;
  // The total cannot be one of the components it adds up.
  const sourceOptions = componentOptions.filter(
    (option) => option.value !== target,
  );
  const name = 'component_sum_config';
  return (
    <>
      <SelectGroup
        name={`${name}.target_component`}
        label={translate('Total component')}
        description={translate(
          'The component whose quantity is set to the sum.',
        )}
        required
        validate={required}
        options={componentOptions}
        isClearable={false}
        placeholder={translate('Select component')}
        simpleValue
      />
      <SelectGroup
        name={`${name}.components`}
        label={translate('Components to add up')}
        description={translate(
          'Components entered by the customer or calculated by other options.',
        )}
        required
        validate={requiredArray}
        options={sourceOptions}
        placeholder={translate('Select components')}
        simpleValue
        isMulti
      />
    </>
  );
};
