import { FunctionComponent } from 'react';
import { GroupInvitation } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { UserPermissionRequestsList } from '@/invitations/UserPermissionRequestsList';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { getGroupInvitationLink } from './utils';

export const GroupInvitationsListExpandableRow: FunctionComponent<{
  row: GroupInvitation;
}> = ({ row }) => (
  <ExpandableContainer>
    <PropertyList
      variant="summary"
      space={4}
      termWidth="sm"
      labelClass="font-semibold"
    >
      <PropertyItem
        label={translate('Invitation link')}
        value={getGroupInvitationLink(row)}
        hasCopy
      />
      <PropertyItem
        label={translate('Scope type')}
        value={propVal.enum(row.scope_type, {
          labels: {
            customer: translate('Organization'),
            project: translate('Project'),
          },
        })}
      />
      <PropertyItem
        label={translate('Auto approve')}
        value={propVal.boolean(row.auto_approve, { display: 'badge' })}
      />
      <PropertyItem
        label={translate('Auto create project')}
        value={propVal.boolean(row.auto_create_project, { display: 'badge' })}
      />
      <PropertyItem
        label={translate('Custom project details')}
        value={propVal.boolean(row.allow_custom_project_details, {
          display: 'badge',
        })}
      />
      <PropertyItem
        label={translate('Multiple requests')}
        value={propVal.boolean(row.allow_multiple_requests, {
          display: 'badge',
        })}
      />
      <PropertyItem label={translate('Custom text')} value={row.custom_text} />
      <PropertyItem
        label={translate('Project name template')}
        value={row.project_name_template}
      />
      <PropertyItem
        label={translate('Allowed affiliations')}
        value={propVal.list(row.user_affiliations)}
      />
      <PropertyItem
        label={translate('Allowed email patterns')}
        value={propVal.list(row.user_email_patterns)}
      />
      <PropertyItem
        label={translate('Allowed nationalities')}
        value={propVal.list(row['user_nationalities'])}
      />
      <PropertyItem
        label={translate('Allowed organization types')}
        value={propVal.list(row['user_organization_types'])}
      />
      <PropertyItem
        label={translate('Required assurance levels')}
        value={propVal.list(row['user_assurance_levels'])}
      />
    </PropertyList>

    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </ExpandableContainer>
);
