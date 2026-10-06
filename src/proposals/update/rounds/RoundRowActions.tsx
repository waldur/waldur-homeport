import { FC } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { Call } from '@/proposals/types';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { EditRoundAllocationAction } from './EditRoundAllocationAction';
import { EditRoundReviewAction } from './EditRoundReviewAction';
import { EditRoundSubmissionAction } from './EditRoundSubmissionAction';
import { RoundDeleteAction } from './RoundDeleteAction';
import { RoundLifecycleActions } from './RoundLifecycleActions';

interface RoundRowActionsProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
  /** CALL.UPDATE on a call that is not archived: edit or delete the round. */
  canUpdate: boolean;
  /** CALL.CLOSE_ROUNDS: drive the round's lifecycle. */
  canCloseRounds: boolean;
}

export const RoundRowActions: FC<RoundRowActionsProps> = ({
  canUpdate,
  canCloseRounds,
  ...props
}) => {
  return (
    <ActionsMenu>
      {canUpdate && (
        <>
          <EditRoundSubmissionAction {...props} />
          <EditRoundReviewAction {...props} />
          <EditRoundAllocationAction {...props} />
        </>
      )}
      <RoundLifecycleActions
        {...props}
        canUpdate={canUpdate}
        canCloseRounds={canCloseRounds}
      />
      {canUpdate && <RoundDeleteAction {...props} />}
    </ActionsMenu>
  );
};
