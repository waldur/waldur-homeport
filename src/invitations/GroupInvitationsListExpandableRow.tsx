import { FunctionComponent } from 'react';
import { GroupInvitation } from 'waldur-js-client';

import { translate } from '@/i18n';
import { UserPermissionRequestsList } from '@/invitations/UserPermissionRequestsList';
import { Field } from '@/resource/summary';
import { BooleanField } from '@/table/BooleanField';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

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
  return renderFieldOrDash(scopeType);
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
    <Field
      label={translate('Custom project details')}
      value={<BooleanField value={row.allow_custom_project_details} />}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Multiple requests')}
      value={<BooleanField value={row.allow_multiple_requests} />}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    {row.custom_text && (
      <Field
        label={translate('Custom text')}
        value={row.custom_text}
        labelClass="min-w-150px fw-bolder"
        space={5}
      />
    )}
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
    <Field
      label={translate('Allowed nationalities')}
      value={formatList(row['user_nationalities'])}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Allowed organization types')}
      value={formatList(row['user_organization_types'])}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />
    <Field
      label={translate('Required assurance levels')}
      value={formatList(row['user_assurance_levels'])}
      labelClass="min-w-150px fw-bolder"
      space={5}
    />

    <UserPermissionRequestsList groupInvitationUuid={row.uuid} />
  </ExpandableContainer>
);
