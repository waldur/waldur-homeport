import { FunctionComponent } from 'react';
import { GroupInvitation } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { UserPermissionRequestsList } from '@waldur/invitations/UserPermissionRequestsList';
import { Field } from '@waldur/resource/summary';
import { BooleanField } from '@waldur/table/BooleanField';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { getGroupInvitationLink } from './utils';

const formatList = (items: unknown): string | undefined => {
  if (Array.isArray(items) && items.length > 0) {
    return items.join(', ');
  }
  return undefined;
};

const formatScopeType = (scopeType: string | null): string => {
  if (scopeType === 'customer') {
    return translate('Organization');
  } else if (scopeType === 'project') {
    return translate('Project');
  }
  return scopeType || 'N/A';
};

export const GroupInvitationsListExpandableRow: FunctionComponent<{
  row: GroupInvitation;
}> = ({ row }) => (
  <ExpandableContainer>
    <Field
      label={translate('Invitation link')}
      value={getGroupInvitationLink(row)}
      hasCopy
      isStuck
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Scope type')}
      value={formatScopeType(row.scope_type)}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Auto approve')}
      value={<BooleanField value={row.auto_approve} />}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Auto create project')}
      value={<BooleanField value={row.auto_create_project} />}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    {row.project_name_template && (
      <Field
        label={translate('Project name template')}
        value={row.project_name_template}
        labelClass="min-w-150px fw-bolder"
        space={5}
      />
    )}
    <Field
      label={translate('Allowed affiliations')}
      value={formatList(row.user_affiliations)}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Allowed email patterns')}
      value={formatList(row.user_email_patterns)}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />

    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </ExpandableContainer>
);
