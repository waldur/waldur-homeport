import { FC } from 'react';
import { components } from 'react-select';
import { OrganizationGroup } from 'waldur-js-client';

import { organizationGroupAutocomplete } from '@/customer/list/autcompletes';
import { RIGHT_ARROW_HTML } from '@/customer/list/constants';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';

const OrganizationGroupFieldOption: FC<any> = (props) => (
  <components.Option {...props}>
    {props.data.parent_name ? (
      <>
        {props.data.parent_name} {RIGHT_ARROW_HTML}{' '}
      </>
    ) : null}
    {props.data.name}
  </components.Option>
);

const OrganizationGroupFieldSingleValue: FC<any> = (props) => {
  const parent_name: string = props.data.name.split(' ')[0];
  const name: string = props.data.name.split(' ')[2];
  return (
    <components.SingleValue {...props}>
      {parent_name === 'undefined' ? name : props.data.name}
    </components.SingleValue>
  );
};

interface SelectFieldProps {
  currentOrganizationGroup: OrganizationGroup;
}

export const SelectParentOrganizationGroup: FC<SelectFieldProps> = ({
  currentOrganizationGroup,
}) => (
  <AsyncSelectGroup
    name="parent"
    label={translate('Parent group')}
    placeholder={translate('Select organization group...')}
    defaultOptions={true}
    getOptionValue={(option) => option.url}
    getOptionLabel={(option) => option.name}
    noOptionsMessage={() => translate('No organization groups')}
    isClearable={true}
    loadOptions={async (query, prevOptions, { page }) => {
      const result = await organizationGroupAutocomplete(query, prevOptions, {
        page,
      });
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
  />
);
