import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import { OfferingComponent } from 'waldur-js-client';

import { BaseButton, FormField, FormFieldset, FormLegend } from 'waldur-ui';

import { composeValidators, required } from '@/core/validators';
import { NumberField, SelectField } from '@/form';
import { translate } from '@/i18n';
import { validateNonNegative } from '@/marketplace/common/utils';
import { useComponentLimitsArrayFieldFunctions } from '@/marketplace/offerings/details/policies/ComponentLimitsField';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { policyPeriodOptions } from '../cost-policies/utils';

interface FieldsListGroupProps extends FieldArrayRenderProps<any, HTMLElement> {
  components: (OfferingComponent & { offering_name })[];
}

const FieldsListGroup = ({ fields, components }: FieldsListGroupProps) => {
  const { addRow, removeRow, getAvailableOptions } =
    useComponentLimitsArrayFieldFunctions(
      fields,
      components,
      'component',
      'uuid',
    );

  return (
    <>
      {fields.length > 0 && (
        <FormField id="component-limits-set">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-1/2">{translate('Component')}</td>
                  <td className="w-1/4">{translate('Limit')}</td>
                  <td className="w-1/4">{translate('Period')}</td>
                  <td className="w-[5px]" />
                </tr>
              </thead>
              <tbody>
                {fields.map((component, i) => {
                  const details = components.find(
                    (c) => c.uuid === fields.value[i]?.component,
                  );

                  return (
                    <tr key={component}>
                      <td>
                        <Field
                          name={`${component}.component`}
                          validate={required}
                        >
                          {({ input, meta }) => (
                            <SelectField
                              input={input}
                              meta={meta}
                              aria-label={`${translate('Component')} ${i + 1}`}
                              placeholder={translate('Select component...')}
                              options={getAvailableOptions(details)}
                              getOptionValue={(option) => option.uuid}
                              getOptionLabel={(option) =>
                                `${option.name} (${option.offering_name})`
                              }
                              simpleValue
                              isClearable={false}
                            />
                          )}
                        </Field>
                      </td>
                      <td>
                        <Field
                          name={`${component}.limit`}
                          validate={composeValidators(
                            required,
                            validateNonNegative,
                          )}
                        >
                          {({ input, meta }) => (
                            <NumberField
                              input={input}
                              meta={meta}
                              aria-label={`${translate('Limit')} ${i + 1}`}
                              placeholder="0"
                              unit={details?.measured_unit}
                              min={0}
                            />
                          )}
                        </Field>
                      </td>
                      <td>
                        <Field name={`${component}.period`} validate={required}>
                          {({ input, meta }) => (
                            <SelectField
                              input={input}
                              meta={meta}
                              options={Object.values(policyPeriodOptions)}
                              simpleValue
                              isClearable
                            />
                          )}
                        </Field>
                      </td>
                      <td>
                        <RemovalActionButton
                          action={() => removeRow(i)}
                          disabled={fields.length === 1}
                          disabledReason={translate(
                            'At least one component limit is required',
                          )}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FormField>
      )}
      <div>
        <BaseButton
          tooltip={translate('Add')}
          onClick={addRow}
          iconNode={<PlusCircleIcon weight="bold" />}
          variant="tertiary"
          size="lg"
        />
      </div>
    </>
  );
};

export const ComponentLimitsField = ({ components }) => (
  <FormFieldset className="mb-7">
    <FormLegend required>
      {translate('When component limits reaches')}
    </FormLegend>
    <FieldArray name="component_limits_set" validate={required}>
      {(props) => <FieldsListGroup {...props} components={components} />}
    </FieldArray>
  </FormFieldset>
);
