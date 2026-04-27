import { FC } from 'react';
import { Field } from 'react-final-form';
import { OrganizationGroup } from 'waldur-js-client';

import { organizationGroupAutocomplete } from '@/customer/list/autcompletes';
import { AsyncPaginate } from '@/form/themed-select';

import {
  commonAsyncPaginateProps,
  OrganizationGroupFieldOption,
  OrganizationGroupFieldSingleValue,
} from './SelectOrganizationGroupFieldHelpers';

interface SelectFieldProps {
  reactSelectProps?: object;
  currentOrganizationGroup: OrganizationGroup;
}

export const SelectOrganizationGroupField: FC<SelectFieldProps> = ({
  reactSelectProps,
  currentOrganizationGroup,
}) => (
  <Field
    name="parent"
    render={({ input }) => (
      <AsyncPaginate
        {...commonAsyncPaginateProps}
        loadOptions={(query, prevOptions, { page }) =>
          organizationGroupAutocomplete(query, prevOptions, { page }).then(
            (result) => ({
              ...result,
              options: result.options.filter(
                (option: OrganizationGroup) =>
                  option.uuid !== currentOrganizationGroup?.uuid,
              ),
            }),
          )
        }
        components={{
          OrganizationGroupFieldOption,
          OrganizationGroupFieldSingleValue,
        }}
        value={
          input.value
            ? {
                url: input.value,
                name: input.value.name || currentOrganizationGroup?.parent_name,
              }
            : null
        }
        onChange={(value) => input.onChange(value)}
        {...reactSelectProps}
      />
    )}
  />
);
