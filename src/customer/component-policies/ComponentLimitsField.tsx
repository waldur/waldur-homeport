import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Form, FormLabel } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import { OfferingComponent } from 'waldur-js-client';

import { composeValidators, required } from '@waldur/core/validators';
import { NumberField, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { validateNonNegative } from '@waldur/marketplace/common/utils';
import { useComponentLimitsArrayFieldFunctions } from '@waldur/marketplace/offerings/details/policies/ComponentLimitsField';
import { ActionButton } from '@waldur/table/ActionButton';

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
        <Form.Group id="component-limits-set">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-50">{translate('Component')}</td>
                  <td className="w-25">{translate('Limit')}</td>
                  <td className="w-25">{translate('Period')}</td>
                  <td className="w-5px" />
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
                          component={SelectField as any}
                          validate={required}
                          placeholder={translate('Select component...')}
                          options={getAvailableOptions(details)}
                          getOptionValue={(option) => option.uuid}
                          getOptionLabel={(option) =>
                            `${option.name} (${option.offering_name})`
                          }
                          simpleValue
                          isClearable={false}
                        />
                      </td>
                      <td>
                        <Field
                          name={`${component}.limit`}
                          component={NumberField as any}
                          validate={composeValidators(
                            required,
                            validateNonNegative,
                          )}
                          placeholder="0"
                          unit={details?.measured_unit}
                          min={0}
                        />
                      </td>
                      <td>
                        <Field
                          name={`${component}.period`}
                          component={SelectField as any}
                          validate={required}
                          options={Object.values(policyPeriodOptions)}
                          simpleValue
                          isClearable
                        />
                      </td>
                      <td>
                        <ActionButton
                          variant="danger"
                          action={() => removeRow(i)}
                          disabled={fields.length === 1}
                          iconNode={<TrashIcon weight="bold" />}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <div>
        <ActionButton
          action={addRow}
          iconNode={<PlusCircleIcon weight="bold" />}
        />
      </div>
    </>
  );
};

export const ComponentLimitsField = ({ components }) => (
  <div className="mb-7">
    <FormLabel className="required">
      {translate('When component limits reaches')}
    </FormLabel>
    <FieldArray name="component_limits_set" validate={required}>
      {(props) => <FieldsListGroup {...props} components={components} />}
    </FieldArray>
  </div>
);
