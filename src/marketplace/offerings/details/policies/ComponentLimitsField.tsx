import { Trash } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Button, Form, FormLabel } from 'react-bootstrap';
import { BaseFieldArrayProps, Field, FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, NumberField, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

interface ComponentLimitsFieldProps extends BaseFieldArrayProps<any> {
  components: OfferingComponent[];
}

const FieldsListGroup = ({ fields, components }: ComponentLimitsFieldProps) => {
  const availableComponentsFilter = (item) => {
    let res = true;
    if (fields.length > 0) {
      fields.forEach((_, i) => {
        const comp = fields.get(i);
        if (comp && comp.type === item.type) {
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

  const removeRow = (index) =>
    fields._isFieldArray && fields.length > 1 && fields.remove(index);

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
                    (c) => c.type === fields.get(i).type,
                  );

                  return (
                    <Fragment key={component}>
                      <tr>
                        <td>
                          <Field
                            name={`${component}.type`}
                            component={FormGroup}
                            validate={[required]}
                            placeholder={translate('Select component') + '...'}
                            options={getAvailableOptions(details)}
                            getOptionValue={(option) => option.type}
                            getOptionLabel={(option) => option.name}
                            simpleValue
                            isClearable={false}
                            required={true}
                            hideLabel
                            spaceless
                          >
                            <SelectField />
                          </Field>
                        </td>
                        <td>
                          <Field
                            name={`${component}.limit`}
                            required={true}
                            component={FormGroup}
                            validate={[required]}
                            unit={details?.measured_unit}
                            hideLabel
                            spaceless
                          >
                            <NumberField />
                          </Field>
                        </td>
                        <td>
                          <Button
                            variant="light-danger"
                            className="btn-icon"
                            onClick={() => removeRow(i)}
                            disabled={fields.length === 1}
                          >
                            <span className="svg-icon svg-icon-2">
                              <Trash />
                            </span>
                          </Button>
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
          <Button variant="light" className="btn-icon" onClick={addRow}>
            <i className="fa fa-plus fs-4" />
          </Button>
        </div>
      )}
    </>
  );
};

export const ComponentLimitsField = ({
  components,
}: ComponentLimitsFieldProps) => (
  <div className="mb-7">
    <FormLabel className="required">
      {translate('When component limits reaches')}
    </FormLabel>
    <FieldArray
      name="component_limits_set"
      components={components}
      component={FieldsListGroup}
      validate={[required]}
      rerenderOnEveryChange
    />
  </div>
);
