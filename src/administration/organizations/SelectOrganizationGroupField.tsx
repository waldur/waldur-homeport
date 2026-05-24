import { FC } from 'react';
import { Field } from 'react-final-form';
import { OrganizationGroup } from 'waldur-js-client';

import { organizationGroupAutocomplete } from '@/customer/list/autcompletes';
import { AsyncSelect } from '@/form/select';

import {
  commonAsyncSelectProps,
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
      <AsyncSelect
        {...commonAsyncSelectProps}
        loadOptions={async (query, prevOptions, { page }) => {
          const result = await organizationGroupAutocomplete(
            query,
            prevOptions,
            { page },
          );
          return {
            ...result,
            options: result.options.filter(
              (option: OrganizationGroup) =>
                option.uuid !== currentOrganizationGroup?.uuid,
            ),
          };
        }}
        components={{
          Option: OrganizationGroupFieldOption,
          SingleValue: OrganizationGroupFieldSingleValue,
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
