import { FC } from 'react';

import { Call } from '@/proposals/types';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { DirectEmailInviteAction } from './DirectEmailInviteAction';
import { GenerateMatchesAction } from './GenerateMatchesAction';
import { SendInvitationsAction } from './SendInvitationsAction';

interface ReviewerDiscoveryActionsProps {
  call: Call;
  refetch: () => void;
}

export const ReviewerDiscoveryActions: FC<ReviewerDiscoveryActionsProps> = ({
  call,
  refetch,
}) => {
  return (
    <ActionsMenu toggle="labeled" side="bottom" variant="secondary">
      <GenerateMatchesAction call={call} refetch={refetch} />
      <SendInvitationsAction call={call} refetch={refetch} />
      <DirectEmailInviteAction call={call} refetch={refetch} />
    </ActionsMenu>
  );
};
