import {
  ArchiveIcon,
  CopyIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import {
  callProposalProjectRoleMappingsCount,
  proposalProtectedCallsActivate,
  proposalProtectedCallsArchive,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { RoleType } from '@/permissions/types';
import { getPermissionDisabledTooltip } from '@/permissions/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';
import {
  ActionsDropdownComponent,
  ActionsDropdownSeparator,
} from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';
import { canUpdateCall } from '../utils';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '../workflow/queries';

import { NoRoleMappingsWarning } from './role-mapping/NoRoleMappingsWarning';

const DuplicateCallDialog = lazyComponent(() =>
  import('@/proposals/details/DuplicateCallDialog').then((m) => ({
    default: m.DuplicateCallDialog,
  })),
);

const ExportCallDialog = lazyComponent(() =>
  import('@/proposals/transfer/ExportCallDialog').then((m) => ({
    default: m.ExportCallDialog,
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

  const user = useUser();

  // Activate and archive are call writes, so they follow the shared rule.
  const canUpdate = canUpdateCall(user, call);
  // Duplicating writes a *new* call, so the backend gates it on CREATE_CALL
  // held on the managing organisation, not on UPDATE_CALL of the original.
  const canDuplicateCall = Boolean(
    hasPermission(user, {
      permission: PermissionEnum.CREATE_CALL,
      callOrganizerId: call.manager_uuid,
    }),
  );
  // Scope types matter: the helper defaults to project/customer roles, but the
  // roles carrying these permissions live on the call (CALL.MANAGER) and on the
  // managing organisation (CUSTOMER.CALL_ORGANIZER, content type call_organizer).
  const CALL_SCOPES: RoleType[] = ['call', 'call_organizer'];
  const noUpdateTooltip = canUpdate
    ? null
    : getPermissionDisabledTooltip(PermissionEnum.UPDATE_CALL, CALL_SCOPES);
  const noDuplicateTooltip = canDuplicateCall
    ? null
    : getPermissionDisabledTooltip(PermissionEnum.CREATE_CALL, CALL_SCOPES);

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
          // Counted at click time so a mapping added a moment ago on the Role
          // mapping tab clears the warning. A failed count stays silent: the
          // warning is advice, not a gate.
          const hasRoleMappings = await callProposalProjectRoleMappingsCount({
            query: { call_uuid: call.uuid },
          }).then(
            (result) => fetchResultCount(result) > 0,
            () => true,
          );
          const notice = translate(
            'Please make sure the call configuration is complete before activating the call. Once activated, the configuration can no longer be changed.',
          );
          await confirm(
            translate('Activate call'),
            hasRoleMappings ? (
              notice
            ) : (
              <>
                {notice}
                <NoRoleMappingsWarning className="mt-5" />
              </>
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

  const handleExport = useCallback(() => {
    openDialog(ExportCallDialog, { resolve: { call } });
  }, [openDialog, call]);

  // Exporting reads the whole configuration, so it takes the same right as
  // editing it.
  const exportItem = (
    <ActionItem
      title={translate('Export')}
      action={handleExport}
      iconNode={<DownloadSimpleIcon weight="bold" />}
      disabled={!canUpdate}
      tooltip={noUpdateTooltip}
    />
  );

  const tooltipMessage = !canUpdate
    ? noUpdateTooltip
    : !hasRounds
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
          disabled={!canUpdate}
          tooltip={noUpdateTooltip}
        />
        <ActionItem
          title={translate('Duplicate call')}
          action={handleDuplicate}
          iconNode={<CopyIcon weight="bold" />}
          disabled={!canDuplicateCall}
          tooltip={noDuplicateTooltip}
        />
        {exportItem}
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
          disabled={!canDuplicateCall}
          tooltip={noDuplicateTooltip}
        />
        {exportItem}
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
        disabled={!canDuplicateCall}
        tooltip={noDuplicateTooltip}
      />
      {exportItem}
      <ActionsDropdownSeparator className="border-secondary" />
      <ActionItem
        title={translate('Archive')}
        action={() => editCallState('archive', translate('Archive'))}
        iconNode={<ArchiveIcon weight="bold" />}
        iconColor="danger"
        className="text-danger"
        disabled={!canUpdate}
        tooltip={noUpdateTooltip}
      />
    </ActionsDropdownComponent>
  );
};
