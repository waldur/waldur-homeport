import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Form, FormLabel } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { required } from '@waldur/core/validators';
import { NumberField, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { ActionButton } from '@waldur/table/ActionButton';

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
        <Form.Group id="component-limits-set">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-50">{translate('Component')}</td>
                  <td>{translate('Limit')}</td>
                  <td className="w-5px" />
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
                          <Field
                            name={`${component}.type`}
                            component={SelectField as any}
                            validate={required}
                            placeholder={translate('Select component...')}
                            options={getAvailableOptions(details)}
                            getOptionValue={(option) => option.type}
                            getOptionLabel={(option) => option.name}
                            simpleValue
                            isClearable={false}
                          />
                        </td>
                        <td>
                          <Field
                            name={`${component}.limit`}
                            component={NumberField as any}
                            validate={required}
                            unit={details?.measured_unit}
                          />
                        </td>
                        <td>
                          <ActionButton
                            title={translate('Remove')}
                            variant="danger"
                            action={() => removeRow(i)}
                            disabled={fields.length === 1}
                            iconNode={<TrashIcon weight="bold" />}
                          />
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      {fields.length < components.length && (
        <div>
          <ActionButton
            title={translate('Add')}
            variant="tertiary"
            action={addRow}
            iconNode={<PlusCircleIcon weight="bold" />}
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
  <div className="mb-7">
    <FormLabel className="required">
      {translate('When component limits reaches')}
    </FormLabel>
    <FieldArray name="component_limits_set" validate={required}>
      {(props) => <FieldsListGroup {...props} components={components} />}
    </FieldArray>
  </div>
);
