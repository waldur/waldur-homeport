import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Form, FormLabel } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { IconButton } from '@/core/buttons/IconButton';
import { required } from '@/core/validators';
import { NumberField, StringField } from '@/form';
import { translate } from '@/i18n';

interface TresWeight {
  key: string;
  value: number;
}

const defaultTresTypes = ['CPU', 'Mem', 'GRES/gpu'];

const FieldsListGroup = ({
  fields,
}: FieldArrayRenderProps<TresWeight, HTMLElement>) => {
  const addRow = () => {
    fields.push({ key: '', value: 0 });
  };

  const removeRow = (index: number) => {
    if (fields.length && fields.length > 1) {
      fields.remove(index);
    }
  };

  return (
    <>
      {fields.length && fields.length > 0 && (
        <Form.Group id="tres-billing-weights">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-50">{translate('Resource Type')}</td>
                  <td>{translate('Weight')}</td>
                  <td className="w-5px" />
                </tr>
              </thead>
              <tbody>
                {fields.map((name, index) => (
                  <Fragment key={name}>
                    <tr>
                      <td>
                        <Field
                          name={`${name}.key`}
                          component={StringField as any}
                          validate={required}
                          placeholder={translate('e.g., CPU, Mem, GRES/gpu')}
                          list="tres-suggestions"
                        />
                        <datalist id="tres-suggestions">
                          {defaultTresTypes.map((type) => (
                            <option key={type} value={type} />
                          ))}
                        </datalist>
                      </td>
                      <td>
                        <Field
                          name={`${name}.value`}
                          component={NumberField as any}
                          validate={required}
                          step="any"
                          min={0}
                        />
                      </td>
                      <td>
                        <IconButton
                          iconNode={<TrashIcon weight="bold" />}
                          tooltip={translate('Remove')}
                          onClick={() => removeRow(index)}
                          variant="danger"
                          disabled={fields.length === 1}
                        />
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <div>
        <IconButton
          iconNode={<PlusCircleIcon weight="bold" />}
          tooltip={translate('Add')}
          onClick={addRow}
          variant="tertiary"
        />
      </div>
    </>
  );
};

export const TresBillingWeightsField = () => (
  <div className="mb-7">
    <FormLabel>{translate('TRES Billing Weights')}</FormLabel>
    <div className="form-text mb-3">
      {translate(
        'Define weights for each TRES type to calculate billing units.',
      )}
    </div>
    <FieldArray name="tres_billing_weights_array">
      {(props) => <FieldsListGroup {...props} />}
    </FieldArray>
  </div>
);

// Helper functions for converting between array and Record formats
export const recordToArray = (record: Record<string, number>): TresWeight[] => {
  return Object.entries(record).map(([key, value]) => ({ key, value }));
};

export const arrayToRecord = (array: TresWeight[]): Record<string, number> => {
  return array.reduce(
    (acc, { key, value }) => {
      if (key) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, number>,
  );
};
