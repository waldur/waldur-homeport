import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import {
  BaseButton,
  FormField,
  FormFieldset,
  FormLegend,
  FormText,
} from 'waldur-ui';

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
        <FormField id="tres-billing-weights">
          <div>
            <table className="table px-0 mb-0">
              <thead>
                <tr>
                  <td className="w-1/2">{translate('Resource Type')}</td>
                  <td>{translate('Weight')}</td>
                  <td className="w-[5px]" />
                </tr>
              </thead>
              <tbody>
                {fields.map((name, index) => (
                  <Fragment key={name}>
                    <tr>
                      <td>
                        <Field name={`${name}.key`} validate={required}>
                          {({ input, meta }) => (
                            <StringField
                              input={input}
                              meta={meta}
                              aria-label={`${translate('Resource Type')} ${index + 1}`}
                              placeholder={translate(
                                'e.g., CPU, Mem, GRES/gpu',
                              )}
                              list="tres-suggestions"
                            />
                          )}
                        </Field>
                        <datalist id="tres-suggestions">
                          {defaultTresTypes.map((type) => (
                            <option key={type} value={type} />
                          ))}
                        </datalist>
                      </td>
                      <td>
                        <Field name={`${name}.value`} validate={required}>
                          {({ input, meta }) => (
                            <NumberField
                              input={input}
                              meta={meta}
                              aria-label={`${translate('Weight')} ${index + 1}`}
                              step="any"
                              min={0}
                            />
                          )}
                        </Field>
                      </td>
                      <td>
                        <BaseButton
                          iconNode={<TrashIcon weight="bold" />}
                          tooltip={translate('Remove')}
                          onClick={() => removeRow(index)}
                          variant="danger"
                          disabled={fields.length === 1}
                          size="lg"
                        />
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </FormField>
      )}
      <div>
        <BaseButton
          iconNode={<PlusCircleIcon weight="bold" />}
          tooltip={translate('Add')}
          onClick={addRow}
          variant="tertiary"
          size="lg"
        />
      </div>
    </>
  );
};

export const TresBillingWeightsField = () => (
  <FormFieldset className="mb-7">
    <FormLegend>{translate('TRES Billing Weights')}</FormLegend>
    <FormText as="div" className="mb-3">
      {translate(
        'Define weights for each TRES type to calculate billing units.',
      )}
    </FormText>
    <FieldArray name="tres_billing_weights_array">
      {(props) => <FieldsListGroup {...props} />}
    </FieldArray>
  </FormFieldset>
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
