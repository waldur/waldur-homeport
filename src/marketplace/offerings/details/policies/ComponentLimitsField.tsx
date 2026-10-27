import { PlusCircleIcon } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import { OfferingComponent } from 'waldur-js-client';

import { BaseButton, FormField, FormFieldset, FormLegend } from 'waldur-ui';

import { required } from '@/core/validators';
import { NumberField, SelectField } from '@/form';
import { translate } from '@/i18n';
import { RemovalActionButton } from '@/table/RemovalActionButton';

interface ComponentLimitsFieldProps extends FieldArrayRenderProps<
  any,
  HTMLElement
> {
  components: OfferingComponent[];
}

export const useComponentLimitsArrayFieldFunctions = (
  fields,
  components: OfferingComponent[],
  fieldName: string = 'type',
  findKey: 'type' | 'uuid' = 'type',
) => {
  const availableComponentsFilter = (item) => {
    let res = true;
    if (fields.length > 0) {
      fields.forEach((_, i) => {
        const comp = fields.value[i];
        if (comp && comp[fieldName] === item[findKey]) {
          res = false;
        }
      });
    }
    return res;
  };

  const getAvailableOptions = (selectedItem: OfferingComponent = null) =>
    [selectedItem]
      .concat(components.filter(availableComponentsFilter))
      .filter(Boolean);

  const addRow = () => {
    if (fields.length < components.length) {
      fields.push({});
    }
  };

  const removeRow = (index) => fields.length > 1 && fields.remove(index);

  return { addRow, removeRow, getAvailableOptions };
};

const FieldsListGroup = ({ fields, components }: ComponentLimitsFieldProps) => {
  const { addRow, removeRow, getAvailableOptions } =
    useComponentLimitsArrayFieldFunctions(fields, components);

  return (
    <>
      {fields.length > 0 && (
        <FormField id="component-limits-set">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-1/2">{translate('Component')}</td>
                  <td>{translate('Limit')}</td>
                  <td className="w-[5px]" />
                </tr>
              </thead>
              <tbody>
                {fields.map((component, i) => {
                  const details = components.find(
                    (c) => c.type === fields.value[i]?.type,
                  );

                  return (
                    <Fragment key={component}>
                      <tr>
                        <td>
                          <Field name={`${component}.type`} validate={required}>
                            {({ input, meta }) => (
                              <SelectField
                                input={input}
                                meta={meta}
                                aria-label={`${translate('Component')} ${i + 1}`}
                                placeholder={translate('Select component...')}
                                options={getAvailableOptions(details)}
                                getOptionValue={(option) => option.type}
                                getOptionLabel={(option) => option.name}
                                simpleValue
                                isClearable={false}
                              />
                            )}
                          </Field>
                        </td>
                        <td>
                          <Field
                            name={`${component}.limit`}
                            validate={required}
                          >
                            {({ input, meta }) => (
                              <NumberField
                                input={input}
                                meta={meta}
                                aria-label={`${translate('Limit')} ${i + 1}`}
                                unit={details?.measured_unit}
                              />
                            )}
                          </Field>
                        </td>
                        <td>
                          <RemovalActionButton
                            title={translate('Remove')}
                            action={() => removeRow(i)}
                            disabled={fields.length === 1}
                            disabledReason={translate(
                              'At least one component limit is required',
                            )}
                          />
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FormField>
      )}
      {fields.length < components.length && (
        <div>
          <BaseButton
            label={translate('Add')}
            variant="tertiary"
            onClick={addRow}
            iconNode={<PlusCircleIcon weight="bold" />}
            size="lg"
          />
        </div>
      )}
    </>
  );
};

interface ComponentLimitsFieldWrapperProps {
  components: OfferingComponent[];
}

export const ComponentLimitsField = ({
  components,
}: ComponentLimitsFieldWrapperProps) => (
  <FormFieldset className="mb-5.5">
    <FormLegend required>
      {translate('When component limits reaches')}
    </FormLegend>
    <FieldArray name="component_limits_set" validate={required}>
      {(props) => <FieldsListGroup {...props} components={components} />}
    </FieldArray>
  </FormFieldset>
);
