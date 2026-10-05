import {
  ArrowsClockwiseIcon,
  EyeIcon,
  PauseIcon,
  PlayIcon,
  SlidersIcon,
  TrashIcon,
  UserMinusIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceResourceApiKeysDestroy,
  marketplaceResourceApiKeysPartialUpdate,
  marketplaceResourceApiKeysPause,
  marketplaceResourceApiKeysResume,
  marketplaceResourceApiKeysRetry,
  marketplaceResourceApiKeysRotate,
  Resource,
} from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { RevealApiKeyDialog } from './RevealApiKeyDialog';
import {
  canRevealKey,
  getErredTooltip,
  getFailedCommand,
  getStateVariant,
  UNGOVERNED_COMMANDS,
} from './state';
import { ApiKeyRow, KeyComponent } from './types';
import { useInvalidateRevealedKey } from './useResourceApiKeys';

const EditApiKeySettingsDialog = lazyComponent(() =>
  import('./EditApiKeySettingsDialog').then((module) => ({
    default: module.EditApiKeySettingsDialog,
  })),
);

const confirmOptions = () => ({
  positiveButton: translate('Confirm'),
  negativeButton: translate('Cancel'),
});

export const ApiKeyActionsDropdown: FC<{
  row: ApiKeyRow;
  resource: Resource;
  components: KeyComponent[];
  models: string[];
  canManage: boolean;
  // Pause and per-key settings need the offering's key management opt-in;
  // rotate and resume do not.
  keyManagement: boolean;
  refetch: () => void;
}> = ({
  row,
  resource,
  components,
  models,
  canManage,
  keyManagement,
  refetch,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  const invalidateReveal = useInvalidateRevealedKey();
  const isOk = row.state === 'OK';
  const isErred = row.state === 'Erred';
  const isPaused = row.state === 'Paused';
  // A request that has not been created yet, or whose creation failed, has no
  // client_id and holds nothing at the backend: it can only be requested again
  // or deleted, and deleting it drops it at once, even while still Creating.
  const neverCreated = !row.client_id;
  // An Erred key takes only its failed command again (or a delete). With key
  // management off a governed command cannot be retried, so rotate and resume
  // take its place instead of leaving the key stuck.
  const failedCommand = isErred ? getFailedCommand(row) : undefined;
  const canRetry =
    isErred && (keyManagement || UNGOVERNED_COMMANDS.includes(failedCommand!));
  // Either ungoverned command may take a stranded key's failed one's place, and
  // resume is the one that brings back a key whose pause failed.
  const resumesErred = isErred && !canRetry;
  const resumes = isPaused || resumesErred;
  const canReveal = canRevealKey(row, user);
  const keyName = row.client_id ? (
    <strong>{row.client_id}</strong>
  ) : (
    translate('this key')
  );

  const { mutate: rotate, isPending: rotating } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysRotate({ path: { uuid: row.uuid } }),
    confirmation: {
      title: translate('Rotate API key'),
      body: translate(
        'Replace the credentials for API key {name}? Anything still using them will stop working, and the key ID may change too. Your other keys are unaffected, so rotate one at a time to stay online.',
        { name: keyName },
        formatJsxTemplate,
      ),
      options: confirmOptions(),
    },
    successMessage: translate('API key rotation requested'),
    errorMessage: translate('Unable to rotate the API key.'),
    onSuccess: () => {
      invalidateReveal(row.uuid);
      refetch();
    },
  });

  // Sends the command that failed again, whichever it was: a rotation in its
  // place would leave a failed pause live, or a failed update unapplied.
  const { mutate: retry, isPending: retrying } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysRetry({ path: { uuid: row.uuid } }),
    successMessage: translate('API key retry requested'),
    errorMessage: translate('Unable to retry the API key command.'),
    onSuccess: () => {
      invalidateReveal(row.uuid);
      refetch();
    },
  });

  const { mutate: setPaused, isPending: pausing } = useManagedMutation({
    mutationFn: () =>
      resumes
        ? marketplaceResourceApiKeysResume({ path: { uuid: row.uuid } })
        : marketplaceResourceApiKeysPause({ path: { uuid: row.uuid } }),
    confirmation: resumes
      ? undefined
      : {
          title: translate('Pause API key'),
          body: translate(
            'Pause API key {name}? Anything using it stops working until you resume it. The key keeps its value.',
            { name: keyName },
            formatJsxTemplate,
          ),
          options: confirmOptions(),
        },
    successMessage: resumes
      ? translate('API key resume requested')
      : translate('API key pause requested'),
    errorMessage: translate('Unable to update the API key state.'),
    onSuccess: () => refetch(),
  });

  const { mutate: remove, isPending: removing } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysDestroy({ path: { uuid: row.uuid } }),
    // The provider has to revoke a created key at the backend; dropping the
    // row alone would leave a working credential behind.
    confirmation: {
      title: translate('Delete API key'),
      body: neverCreated
        ? translate(
            'Withdraw this key request? The key was never created, so it is removed at once.',
          )
        : translate(
            'Delete API key {name}? It stops working once the provider revokes it, and it cannot be restored.',
            { name: keyName },
            formatJsxTemplate,
          ),
      options: { ...confirmOptions(), forDeletion: true },
    },
    successMessage: neverCreated
      ? translate('API key request withdrawn')
      : translate('API key deletion requested'),
    errorMessage: translate('Unable to delete the API key.'),
    onSuccess: () => {
      invalidateReveal(row.uuid);
      refetch();
    },
  });

  // Without key management the settings dialog is gone, yet reveal still
  // honours an assignee set while it was on; lifting it is the one setting that
  // stays open, so the key can be shared with the project again.
  const { mutate: unassign, isPending: unassigning } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysPartialUpdate({
        path: { uuid: row.uuid },
        body: { user: null },
      }),
    confirmation: {
      title: translate('Unassign API key'),
      body: translate(
        'Unassign API key {name} from {user}? Anyone with access to the resource can then reveal it.',
        { name: keyName, user: <strong>{row.user_full_name}</strong> },
        formatJsxTemplate,
      ),
      options: confirmOptions(),
    },
    successMessage: translate('API key unassigned'),
    errorMessage: translate('Unable to unassign the API key.'),
    onSuccess: () => refetch(),
  });

  const inProgress =
    getStateVariant(row.state).active ||
    rotating ||
    retrying ||
    pausing ||
    removing
      ? translate('An operation is already in progress.')
      : undefined;
  // A pending request may be withdrawn: nothing is in flight at the backend.
  const deleteBlocked =
    rotating ||
    retrying ||
    pausing ||
    removing ||
    (getStateVariant(row.state).active && !neverCreated)
      ? translate('An operation is already in progress.')
      : undefined;
  const neverCreatedTooltip = neverCreated
    ? translate('The key was never created, so it has nothing to rotate.')
    : undefined;
  // A key paused while key management was on can still be resumed after it
  // was switched off.
  const showPauseResume = keyManagement || resumes;
  // A failed settings update can be corrected before it is sent again; Retry
  // re-sends it unchanged.
  const settingsEditable =
    isOk || isPaused || (isErred && failedCommand === 'update');
  // The assignee is Waldur's alone, so it can change in any state short of
  // deletion, mid-operation too.
  const canEdit = row.state !== 'Deleting' && row.state !== 'Deleted';
  const editBlocked =
    rotating || retrying || pausing || removing
      ? translate('An operation is already in progress.')
      : !canEdit
        ? translate('A deleted key cannot be edited.')
        : undefined;

  return (
    <ActionsDropdown row={row} refetch={refetch} size="sm">
      <ActionItem
        title={translate('Reveal')}
        action={() =>
          openDialog(RevealApiKeyDialog, {
            resolve: {
              uuid: row.uuid,
              clientId: row.client_id,
              canManage,
              onRotate: () => rotate(),
            },
          })
        }
        iconNode={<EyeIcon weight="bold" />}
        disabled={!canReveal}
        tooltip={
          !isOk
            ? translate('The key can be revealed once it is active.')
            : !canReveal
              ? translate('Only the assignee can reveal this key.')
              : undefined
        }
      />
      {canManage && showPauseResume && (
        <ActionItem
          title={resumes ? translate('Resume') : translate('Pause')}
          action={() => setPaused(undefined)}
          iconNode={
            resumes ? <PlayIcon weight="bold" /> : <PauseIcon weight="bold" />
          }
          disabled={
            Boolean(inProgress) ||
            !(isOk || resumes) ||
            (resumesErred && neverCreated)
          }
          tooltip={
            inProgress ??
            (resumesErred && neverCreated
              ? translate(
                  'The key was never created, so it has nothing to resume.',
                )
              : undefined) ??
            (isOk || resumes
              ? row.paused_by_limit
                ? translate(
                    'Raising the limit resumes the key on its own. Resumed while still over its limit, it is paused again on the next usage report.',
                  )
                : undefined
              : translate('The key can be paused once it is active.'))
          }
        />
      )}
      {canManage && canRetry && (
        <ActionItem
          title={translate('Retry')}
          action={() => retry(undefined)}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          disabled={Boolean(inProgress)}
          tooltip={inProgress ?? getErredTooltip(row)}
        />
      )}
      {canManage && !canRetry && (
        <ActionItem
          title={translate('Rotate')}
          action={() => rotate(undefined)}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          disabled={Boolean(inProgress) || isPaused || neverCreated}
          tooltip={
            inProgress ??
            neverCreatedTooltip ??
            (isPaused ? translate('Resume the key to rotate it.') : undefined)
          }
        />
      )}
      {canManage && keyManagement ? (
        <ActionItem
          title={translate('Edit key settings')}
          action={() =>
            openDialog(EditApiKeySettingsDialog, {
              resolve: {
                row,
                resource,
                components,
                models,
                refetch,
                settingsEditable,
              },
              size: 'md',
            })
          }
          iconNode={<SlidersIcon weight="bold" />}
          // A paused key keeps its edits and has them applied when it resumes.
          disabled={Boolean(editBlocked)}
          tooltip={editBlocked}
        />
      ) : null}
      {canManage && !keyManagement && row.user_uuid && (
        <ActionItem
          title={translate('Unassign')}
          action={() => unassign(undefined)}
          iconNode={<UserMinusIcon weight="bold" />}
          disabled={unassigning}
        />
      )}
      {canManage && keyManagement && (
        // Set apart from the reversible actions above it.
        <Menu.Separator />
      )}
      {canManage && keyManagement && (
        <ActionItem
          title={translate('Delete')}
          action={() => remove(undefined)}
          iconNode={<TrashIcon weight="bold" />}
          // Red only while it can be used; disabled items are grey like the rest.
          iconColor={deleteBlocked ? undefined : 'danger'}
          className={deleteBlocked ? undefined : 'text-danger'}
          disabled={Boolean(deleteBlocked)}
          tooltip={deleteBlocked}
        />
      )}
    </ActionsDropdown>
  );
};
