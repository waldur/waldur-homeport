import { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change } from 'redux-form';
import { projectsList } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncPaginate } from '@/form/themed-select';
import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';

import { organizationAutocomplete } from '../common/autocompletes';
import { orderCustomerSelector } from '../deploy/selectors';
import { FormGroup } from '../offerings/FormGroup';

import { ORDER_FORM_ID } from './constants';

const CustomerSelect = ({ input, organizationGroups }) => {
  const dispatch = useDispatch();
  const customer = useSelector(orderCustomerSelector);

  const onChange = useCallback(
    async (value) => {
      if (!customer) {
        input.onChange(value);
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
        input.onChange(value);
        const project = await projectsList({
          query: {
            customer: value.uuid,
          },
        }).then((r) => r.data[0]);
        dispatch(change(ORDER_FORM_ID, 'project', project));
      } catch {
        // Swallow
      }
    },
    [customer, dispatch, input],
  );

  const loadOptions = useCallback(
    (query, prevOptions, { page }) =>
      organizationAutocomplete(query, prevOptions, page, {
        organization_group_uuid: organizationGroups.map((group) => group.uuid),
        field: [
          'name',
          'uuid',
          'url',
          'payment_profiles',
          'display_billing_info_in_projects',
        ],
        o: 'name',
      }),
    [organizationGroups],
  );

  return (
    <AsyncPaginate
      label={translate('Organization')}
      value={input.value}
      onChange={onChange}
      placeholder={translate('Select organization...')}
      loadOptions={loadOptions}
      noOptionsMessage={() => translate('No organizations found')}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.uuid}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};

export const CustomerField: FC<{ organizationGroups }> = ({
  organizationGroups,
}) => {
  return (
    <FormGroup label={translate('Organization')} required={true} spaceless>
      <Field
        name="customer"
        validate={required}
        component={CustomerSelect}
        organizationGroups={organizationGroups}
      />
    </FormGroup>
  );
};
