import { FunctionComponent } from 'react';
import { Invitation } from 'waldur-js-client';

import { CopyToClipboardContainer } from '@/core/CopyToClipboardContainer';
import { translate } from '@/i18n';
import { getInvitationLink } from '@/invitations/utils';
import { ExpandableContainer } from '@/table/ExpandableContainer';

/**
 * Expanded section of the admin invitation list. Unlike the team lists'
 * `InvitationExpandableRow` it deliberately shows the invitation link only.
 */
export const InvitationLinkExpandableRow: FunctionComponent<{
  row: Invitation;
}> = ({ row }) => (
  <ExpandableContainer>
    <div>
      <b>{translate('Invitation link')}: </b>
      <CopyToClipboardContainer value={getInvitationLink(row)} />
    </div>
  </ExpandableContainer>
);
