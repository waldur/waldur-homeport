import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change } from 'redux-form';

import { getFirst } from '@waldur/core/api';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { Project } from '@waldur/workspace/types';

import { organizationAutocomplete } from '../common/autocompletes';
import { FormGroup } from '../offerings/FormGroup';

import { ORDER_FORM_ID } from './constants';
import { orderCustomerSelector } from './utils';

export const CustomerField: FC<{ organizationGroups }> = ({
  organizationGroups,
}) => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);
  return (
    <FormGroup required={true}>
      <Field
        name="customer"
        component={(fieldProps) => (
          <AsyncPaginate
            label={translate('Organization')}
            value={fieldProps.input.value}
            onChange={async (value) => {
              if (!customer) {
                fieldProps.input.onChange(value);
                const project = await getFirst<Project>('/projects/', {
                  customer: value.uuid,
                });
                dispatch(change(ORDER_FORM_ID, 'project', project));
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
                const project = await getFirst<Project>('/projects/', {
                  customer: value.uuid,
                });
                dispatch(change(ORDER_FORM_ID, 'project', project));
              } catch (error) {
                // Swallow
              }
            }}
            placeholder={translate('Select organization...')}
            loadOptions={(query, prevOptions, { page }) =>
              organizationAutocomplete(query, prevOptions, page, {
                organization_group_uuid: organizationGroups.map(
                  (group) => group.uuid,
                ),
                field: ['name', 'uuid', 'payment_profiles'],
                o: 'name',
              })
            }
            noOptionsMessage={() => translate('No organizations found')}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
          />
        )}
      />
    </FormGroup>
  );
};
