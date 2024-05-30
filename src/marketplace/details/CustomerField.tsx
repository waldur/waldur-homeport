import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change } from 'redux-form';

import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';

import { organizationAutocomplete } from '../common/autocompletes';
import { FormGroup } from '../offerings/FormGroup';

import { ORDER_FORM_ID } from './constants';
import { orderCustomerSelector } from './utils';

const loadOptions = (query, prevOptions, page) =>
  organizationAutocomplete(query, prevOptions, page, {
    field: ['name', 'uuid', 'projects'],
    o: 'name',
  });

export const CustomerField: FC = () => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);
  return (
    <FormGroup required={true}>
      <Field
        name="customer"
        component={(fieldProps) => (
          <AsyncSelectField
            name="customer"
            label={translate('Organization')}
            value={fieldProps.input.value}
            onChange={async (value) => {
              if (!customer) {
                fieldProps.input.onChange(value);
                dispatch(change(ORDER_FORM_ID, 'project', value.projects[0]));
                return;
              }
              try {
                await waitForConfirmation(
                  dispatch,
                  translate('Confirmation'),
                  translate(
                    'Are you sure you want to select the {name} organization? Please note that entered data will be lost.',
                    { name: <strong>{value.name}</strong> },
                    formatJsxTemplate,
                  ),
                );
                fieldProps.input.onChange(value);
                dispatch(change(ORDER_FORM_ID, 'project', value.projects[0]));
              } catch (error) {
                // Swallow
              }
            }}
            placeholder={translate('Select organization...')}
            loadOptions={loadOptions}
          />
        )}
      />
    </FormGroup>
  );
};
