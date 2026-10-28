import { FC } from 'react';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { RoleField } from './affiliations/RoleField';

export const UserPermissionRequestExpandableRow: FC<{
  row;
}> = ({ row: permissionRequest }) => (
  <ExpandableContainer>
    <div className="grid grid-cols-12 gap-x-5">
      <div className="col-span-12 md:col-span-7 lg:col-span-12 xl:col-span-7 2xl:col-span-6">
        <Field
          label={translate('Role')}
          value={<RoleField row={permissionRequest} />}
          labelCol={5}
          valueCol={7}
        />
        <Field
          label={translate('Scope')}
          value={permissionRequest.scope_name}
          labelCol={5}
          valueCol={7}
        />
        <Field
          label={translate('Organization')}
          value={permissionRequest.customer_name}
          labelCol={5}
          valueCol={7}
        />
        <Field
          label={translate('Project name template')}
          value={permissionRequest.project_name_template}
          labelTooltipLen={false}
          labelCol={5}
          valueCol={7}
        />
        {permissionRequest.project_name && (
          <Field
            label={translate('Requested project name')}
            value={permissionRequest.project_name}
            labelCol={5}
            valueCol={7}
          />
        )}
        {permissionRequest.project_description && (
          <Field
            label={translate('Requested description')}
            value={permissionRequest.project_description}
            labelCol={5}
            valueCol={7}
          />
        )}
      </div>
      <div className="col-span-12 md:col-span-5 lg:col-span-12 xl:col-span-5 2xl:col-span-6">
        <Field
          label={translate('Reviewed at')}
          value={
            permissionRequest.reviewed_at
              ? formatDateTime(permissionRequest.reviewed_at)
              : null
          }
          labelCol={4}
          valueCol={8}
        />
        <Field
          label={translate('Reviewed by')}
          value={permissionRequest.reviewed_by_full_name}
          labelCol={4}
          valueCol={8}
        />
        <Field
          label={translate('Review comment')}
          value={permissionRequest.review_comment}
          labelCol={4}
          valueCol={8}
        />
      </div>
    </div>
  </ExpandableContainer>
);
