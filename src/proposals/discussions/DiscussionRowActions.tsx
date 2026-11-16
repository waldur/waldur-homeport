import {
  ChatsCircleIcon,
  InfoIcon,
  LockSimpleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { StepDiscussion } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { discussionTarget } from './discussionAction';
import { useOpenStepDiscussion } from './StepDiscussionButton';

const StepDiscussionClosedDialog = lazyComponent(() =>
  import('./StepDiscussionClosedDialog').then((module) => ({
    default: module.StepDiscussionClosedDialog,
  })),
);

/**
 * A listed discussion's actions: open its room while it is open and chat is
 * on, and read its record -- who takes or took part, and once closed its
 * history -- in any state. The backend refuses the room to anyone not
 * working on the step, a call manager overseeing it say, and says so.
 */
export const DiscussionRowActions: FC<{
  row: StepDiscussion;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  const open = useOpenStepDiscussion({ refetch });
  const opens = row.state === 'open' && isMatrixChatEnabled();
  return (
    <ActionsDropdown row={row} refetch={refetch}>
      {opens ? (
        <ActionItem
          title={translate('Open discussion')}
          action={() => open.mutate(discussionTarget(row))}
          disabled={open.isPending}
          iconNode={<ChatsCircleIcon weight="bold" />}
        />
      ) : null}
      <ActionItem
        title={
          row.state === 'open'
            ? translate('Who takes part')
            : translate('Who took part')
        }
        action={() =>
          openDialog(StepDiscussionClosedDialog, {
            resolve: { discussionUuid: row.uuid },
          })
        }
        iconNode={
          row.state === 'open' ? (
            <InfoIcon weight="bold" />
          ) : (
            <LockSimpleIcon weight="bold" />
          )
        }
      />
    </ActionsDropdown>
  );
};
