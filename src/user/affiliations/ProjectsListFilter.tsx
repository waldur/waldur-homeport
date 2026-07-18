import { FC } from 'react';

import { translate } from '@/i18n';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { BooleanFilter, SelectFilter } from '@/table';

const getIsRemovedFilterOptions = () => [
  {
    label: translate('All projects'),
    value: '',
  },
  {
    label: translate('Not removed'),
    value: false,
  },
  {
    label: translate('Removed'),
    value: true,
  },
];

export const ProjectsListFilter: FC = () => (
  <>
    <OrganizationFilter
      name="customer_uuid"
      getValueLabel={(option) => option.name}
      instantApply={false}
    />
    <BooleanFilter
      title={translate('Conceal finished projects')}
      name="conceal_finished_projects"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    />
    <BooleanFilter
      title={translate('Include removed')}
      name="include_terminated"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    />
    <SelectFilter
      title={translate('Removal status')}
      name="is_removed"
      badgeValue={(value) =>
        getIsRemovedFilterOptions().find((op) => op.value === value)?.label
      }
      ellipsis={false}
      className="Select"
      placeholder={translate('Select removal status')}
      options={getIsRemovedFilterOptions()}
      noUpdateOnBlur={true}
      simpleValue={true}
      isClearable={true}
    />
  </>
);
