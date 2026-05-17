import { ArchiveIcon, CopyIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  proposalProtectedCallsActivate,
  proposalProtectedCallsArchive,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { Call } from '../types';

const DuplicateCallDialog = lazyComponent(() =>
  import('@/proposals/details/DuplicateCallDialog').then((m) => ({
    default: m.DuplicateCallDialog,
  })),
);

interface CallActionsProps {
  call: Call;
  refetch?(): void;
  className?: string;
}

export const CallActions: FC<CallActionsProps> = ({
  call,
  refetch,
  className,
}) => {
  const { confirm, openDialog } = useModal();

  const { showErrorResponse, showSuccess } = useNotify();

  const hasRounds = call.rounds.length > 0;

  const editCallState = useCallback(
    async (state, label: string) => {
      try {
        await confirm(
          translate('Confirmation'),
          translate('Are you sure you want to {action} this call?', {
            action: label.toLowerCase(),
          }),
        );
        if (state === 'activate') {
          proposalProtectedCallsActivate({ path: { uuid: call.uuid } });
        } else if (state === 'archive') {
          proposalProtectedCallsArchive({ path: { uuid: call.uuid } });
        }
        showSuccess(translate('Call state updated.'));
        refetch();
      } catch (er) {
        if (!er) return;
        showErrorResponse(er, translate('Unable to update call state.'));
      }
    },
    [call, refetch],
  );

  const handleDuplicate = useCallback(() => {
    openDialog(DuplicateCallDialog, {
      resolve: { call, refetch },
      size: 'lg',
    });
  }, [openDialog, call, refetch]);

  const tooltipMessage = !hasRounds
    ? translate('Call must have a round to be activated')
    : null;

  if (call.state === 'draft') {
    return (
      <ActionsDropdownComponent
        labeled
        drop="down"
        variant="secondary"
        className={className}
      >
        <ActionItem
          title={translate('Activate')}
          action={() => editCallState('activate', translate('Activate'))}
          disabled={!hasRounds}
          tooltip={tooltipMessage}
        />
        <ActionItem
          title={translate('Archive')}
          action={() => editCallState('archive', translate('Archive'))}
          iconNode={<ArchiveIcon weight="bold" />}
          iconColor="danger"
          className="text-danger"
        />
        <ActionItem
          title={translate('Duplicate call')}
          action={handleDuplicate}
          iconNode={<CopyIcon weight="bold" />}
        />
      </ActionsDropdownComponent>
    );
  }

  if (call.state === 'archived') {
    return (
      <ActionsDropdownComponent
        labeled
        drop="down"
        variant="secondary"
        className={className}
      >
        <ActionItem
          title={translate('Activate')}
          action={() => editCallState('activate', translate('Activate'))}
          disabled={!hasRounds}
          tooltip={tooltipMessage}
        />
        <ActionItem
          title={translate('Duplicate call')}
          action={handleDuplicate}
          iconNode={<CopyIcon weight="bold" />}
        />
      </ActionsDropdownComponent>
    );
  }

  // Active state: show dropdown with Duplicate + Archive
  return (
    <ActionsDropdownComponent
      labeled
      drop="down"
      variant="secondary"
      className={className}
    >
      <ActionItem
        title={translate('Duplicate call')}
        action={handleDuplicate}
        iconNode={<CopyIcon weight="bold" />}
      />
      <Dropdown.Divider className="border-secondary" />
      <ActionItem
        title={translate('Archive')}
        action={() => editCallState('archive', translate('Archive'))}
        iconNode={<ArchiveIcon weight="bold" />}
        iconColor="danger"
        className="text-danger"
      />
    </ActionsDropdownComponent>
  );
};
