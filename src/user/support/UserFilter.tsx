import { FC } from 'react';

import { OrganizationRoleFilter } from '@/customer/team/OrganizationRoleFilter';
import { ProjectRoleFilter } from '@/customer/team/ProjectRoleFilter';
import { translate } from '@/i18n';
import { OrganizationFilter } from '@/marketplace/orders/OrganizationFilter';
import { SelectFilter } from '@/table';

import { getRoleFilterOptions, getUserStatusFilterOptions } from './utils';

import './UserFilter.scss';

export const UserFilter: FC = () => {
  return (
    <>
      {/* Use the backend key as the field name so this global staff list does
          not pick up the workspace organization context (?organization=...). */}
      <OrganizationFilter name="customer_uuid" />
      <ProjectRoleFilter
        getValueLabel={(value) => value.description || value.name}
        instantApply={false}
      />
      <OrganizationRoleFilter
        getValueLabel={(value) => value.description || value.name}
        instantApply={false}
      />
      <SelectFilter
        name="role"
        title={translate('Role')}
        instantApply={false}
        className="Select"
        placeholder={translate('Select role')}
        options={getRoleFilterOptions()}
        noUpdateOnBlur={true}
        isClearable={true}
        isMulti
      />
      <SelectFilter
        name="is_active"
        title={translate('Status')}
        badgeValue={(value) =>
          getUserStatusFilterOptions().find((op) => op.value === value)?.label
        }
        ellipsis={false}
        className="Select"
        placeholder={translate('Select status')}
        options={getUserStatusFilterOptions()}
        noUpdateOnBlur={true}
        simpleValue={true}
        isClearable={true}
      />
    </>
  );
};
