import { FC } from 'react';
import type { PermissionRequest } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { RoleField } from './affiliations/RoleField';

export const UserPermissionRequestExpandableRow: FC<{
  row: PermissionRequest;
}> = ({ row: permissionRequest }) => (
  <ExpandableContainer>
    <div className="grid grid-cols-12 gap-x-5">
      <div className="col-span-12 md:col-span-7 lg:col-span-12 xl:col-span-7 2xl:col-span-6">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Role')}
            value={<RoleField row={permissionRequest} />}
          />
          <PropertyItem
            label={translate('Scope')}
            value={permissionRequest.scope_name}
          />
          <PropertyItem
            label={translate('Organization')}
            value={permissionRequest.customer_name}
          />
          <PropertyItem
            label={translate('Project name template')}
            value={permissionRequest.project_name_template}
            labelTooltipLen={false}
          />
          <PropertyItem
            label={translate('Requested project name')}
            value={permissionRequest.project_name}
          />
          <PropertyItem
            label={translate('Requested description')}
            value={permissionRequest.project_description}
          />
        </PropertyList>
      </div>
      <div className="col-span-12 md:col-span-5 lg:col-span-12 xl:col-span-5 2xl:col-span-6">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Reviewed at')}
            value={propVal.date(permissionRequest.reviewed_at, {
              precision: 'datetime',
            })}
          />
          <PropertyItem
            label={translate('Reviewed by')}
            value={permissionRequest.reviewed_by_full_name}
          />
          <PropertyItem
            label={translate('Review comment')}
            value={permissionRequest.review_comment}
          />
        </PropertyList>
      </div>
    </div>
  </ExpandableContainer>
);
