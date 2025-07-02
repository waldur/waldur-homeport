import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change } from 'redux-form';
import { projectsList } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';

import { organizationAutocomplete } from '../common/autocompletes';
import { orderCustomerSelector } from '../deploy/selectors';
import { FormGroup } from '../offerings/FormGroup';

import { ORDER_FORM_ID } from './constants';

export const CustomerField: FC<{ organizationGroups }> = ({
  organizationGroups,
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);
  return (
    <FormGroup label={translate('Organization')} required={true} spaceless>
      <Field
        name="customer"
        validate={required}
        component={(fieldProps) => (
          <AsyncPaginate
            label={translate('Organization')}
            value={fieldProps.input.value}
            onChange={async (value) => {
              if (!customer) {
                fieldProps.input.onChange(value);
                const project = await projectsList({
                  query: {
                    customer: value.uuid,
                  },
                }).then((r) => r.data[0]);
                dispatch(change(ORDER_FORM_ID, 'project', project));
                return;
              }
              try {
                await waitForConfirmation(
                  dispatch,
                  translate('Organization change'),
                  translate(
                    "You're switching to the {name} organization. This will discard any entered data. Do you want to proceed?",
                    { name: <strong>{value.name}</strong> },
                    formatJsxTemplate,
                  ),
                  {
                    negativeButton: translate('Cancel'),
                    positiveButton: translate('Confirm'),
                    size: 'sm',
                  },
                );
                fieldProps.input.onChange(value);
                const project = await projectsList({
                  query: {
                    customer: value.uuid,
                  },
                }).then((r) => r.data[0]);
                dispatch(change(ORDER_FORM_ID, 'project', project));
              } catch {
                // Swallow
              }
            }}
            placeholder={translate('Select organization...')}
            loadOptions={(query, prevOptions, { page }) =>
              organizationAutocomplete(query, prevOptions, page, {
                organization_group_uuid: organizationGroups.map(
                  (group) => group.uuid,
                ),
                field: ['name', 'uuid', 'url', 'payment_profiles'],
                o: 'name',
              })
            }
            noOptionsMessage={() => translate('No organizations found')}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        )}
      />
    </FormGroup>
  );
};
