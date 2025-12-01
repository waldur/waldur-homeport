import React from 'react';
import { Invitation } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { formatRoleType } from '@waldur/permissions/utils';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const InvitationExpandableRow: React.FC<{
  row: Invitation;
}> = ({ row }) => (
  <ExpandableContainer hasMultiSelect>
    <p>
      <b>{translate('Invitation link')}: </b>
      <CopyToClipboardContainer
        value={`${location.origin}/invitation/${row.uuid}/`}
      />
    </p>
    {row.civil_number && (
      <p>
        <b>{translate('Civil number')}: </b>
        {row.civil_number}
      </p>
    )}
    {row.scope_type && (
      <p>
        <b>{translate('Scope type')}: </b>
        {
          // @ts-ignore
          formatRoleType(row.scope_type)
        }
      </p>
    )}
    {row.scope_name && (
      <p>
        <b>{translate('Scope name')}: </b>
        {row.scope_name}
      </p>
    )}
    {row.extra_invitation_text && (
      <p style={{ whiteSpace: 'pre-line' }}>
        <b>{translate('Message')}: </b>
        {row.extra_invitation_text}
        {'\n\n'}
        {ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}
      </p>
    )}
    <p>
      <b>{translate('Execution state')}: </b>
      {row.execution_state}
    </p>
    {row.error_message && (
      <p>
        <b>{translate('Error message')}: </b> {row.error_message}
      </p>
    )}
  </ExpandableContainer>
);
