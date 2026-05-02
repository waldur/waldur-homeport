import { FC } from 'react';
import { ProtectedRound } from 'waldur-js-client';

import { Call } from '@/proposals/types';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { EditRoundAllocationAction } from './EditRoundAllocationAction';
import { EditRoundReviewAction } from './EditRoundReviewAction';
import { EditRoundSubmissionAction } from './EditRoundSubmissionAction';
import { RoundDeleteAction } from './RoundDeleteAction';

interface RoundRowActionsProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const RoundRowActions: FC<RoundRowActionsProps> = (props) => {
  return (
    <ActionsDropdownComponent>
      <EditRoundSubmissionAction {...props} />
      <EditRoundReviewAction {...props} />
      <EditRoundAllocationAction {...props} />
      <RoundDeleteAction {...props} />
    </ActionsDropdownComponent>
  );
};
