import { ArchiveIcon, CopyIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
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
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '../workflow/queries';

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

  // `call.offerings` is accepted-only (matches the backend activation guard,
  // which requires an accepted offering — requested/canceled don't count).
  const hasOffering = (call.offerings ?? []).length > 0;

  // Activating a call requires: >= 1 round, >= 1 enabled workflow step, every
  // mandatory step enabled, and >= 1 offering. The backend rejects with 400
  // otherwise; we gate the button locally too so the affordance is clear before
  // the click. Only fetch steps when the action could actually fire (draft /
  // archived calls).
  const canBeActivated = call.state === 'draft' || call.state === 'archived';
  const { data: workflowSteps } = useQuery({
    queryKey: callWorkflowStepsKey(call.uuid),
    queryFn: () => fetchCallWorkflowSteps(call.uuid),
    enabled: canBeActivated,
  });
  const hasEnabledStep =
    !canBeActivated || (workflowSteps?.some((s) => s.is_enabled) ?? false);
  const mandatoryStepsEnabled =
    !canBeActivated ||
    (workflowSteps ?? [])
      .filter((s) => s.is_mandatory)
      .every((s) => s.is_enabled);

  const editCallState = useCallback(
    async (state, label: string) => {
      try {
        if (state === 'activate') {
          await confirm(
            translate('Activate call'),
            translate(
              'Please make sure the call configuration is complete before activating the call. Once activated, the configuration can no longer be changed.',
            ),
            {
              positiveButton: translate('Activate'),
              negativeButton: translate('Cancel'),
              positiveButtonVariant: 'primary',
              type: 'warning',
            },
          );
          await proposalProtectedCallsActivate({ path: { uuid: call.uuid } });
        } else if (state === 'archive') {
          await confirm(
            translate('Confirmation'),
            translate('Are you sure you want to {action} this call?', {
              action: label.toLowerCase(),
            }),
          );
          await proposalProtectedCallsArchive({ path: { uuid: call.uuid } });
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
    : !hasEnabledStep
      ? translate(
          'Call must have at least one enabled workflow step to be activated',
        )
      : !mandatoryStepsEnabled
        ? translate(
            'All mandatory workflow steps must be enabled to activate the call',
          )
        : !hasOffering
          ? translate(
              'Call must have at least one accepted offering to be activated',
            )
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
          disabled={Boolean(tooltipMessage)}
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
          disabled={Boolean(tooltipMessage)}
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
