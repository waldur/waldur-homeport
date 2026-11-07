import { FunctionComponent } from 'react';
import { Invitation } from 'waldur-js-client';

import { CodeLine } from '@/core/CodeLine';
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
      <CodeLine variant="inline" copyable>
        {getInvitationLink(row)}
      </CodeLine>
    </div>
  </ExpandableContainer>
);
