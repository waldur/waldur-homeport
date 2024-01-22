import React from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';

export const InvitationExpandableRow: React.FC<{
  row;
}> = ({ row }) => (
  <>
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
    {row.extra_invitation_text && (
      <p style={{ whiteSpace: 'pre-line' }}>
        <b>{translate('Message')}: </b>
        {row.extra_invitation_text}
        {'\n\n'}
        {ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}
      </p>
    )}
  </>
);
