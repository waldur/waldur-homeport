import {
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { ArrowSettings } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog, waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

import {
  useArrowSettings,
  useDeleteArrowSettings,
  usePauseSync,
  useResumeSync,
} from '../api';

const ArrowSettingsEditDialog = lazyComponent(() =>
  import('./ArrowSettingsEditDialog').then((module) => ({
    default: module.ArrowSettingsEditDialog,
  })),
);

interface ArrowSettingsActionsProps {
  settings: ArrowSettings;
}

export const ArrowSettingsActions = ({
  settings,
}: ArrowSettingsActionsProps) => {
  const dispatch = useDispatch();
  const deleteSettings = useDeleteArrowSettings();
  const pauseSync = usePauseSync();
  const resumeSync = useResumeSync();
  const { refetch } = useArrowSettings();

  const handleEdit = useCallback(() => {
    dispatch(
      openModalDialog(ArrowSettingsEditDialog, {
        resolve: { settings, refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, settings, refetch]);

  const handleDelete = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirm deletion'),
        translate(
          'Are you sure you want to delete Arrow integration settings? This will remove all customer mappings and billing sync data.',
        ),
        { forDeletion: true },
      );
      await deleteSettings.mutateAsync(settings.uuid);
      dispatch(showSuccess(translate('Arrow settings deleted')));
    } catch (e) {
      if (e) {
        dispatch(showErrorResponse(e, translate('Failed to delete settings')));
      }
    }
  }, [dispatch, deleteSettings, settings.uuid]);

  const handlePauseSync = useCallback(async () => {
    try {
      await pauseSync.mutateAsync();
      dispatch(showSuccess(translate('Sync paused')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Failed to pause sync')));
    }
  }, [dispatch, pauseSync, refetch]);

  const handleResumeSync = useCallback(async () => {
    try {
      await resumeSync.mutateAsync();
      dispatch(showSuccess(translate('Sync resumed')));
      refetch();
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Failed to resume sync')));
    }
  }, [dispatch, resumeSync, refetch]);

  return (
    <div className="d-flex gap-2">
      {settings.sync_enabled ? (
        <ActionButton
          action={handlePauseSync}
          title={translate('Pause sync')}
          iconNode={<PauseIcon weight="bold" />}
          variant="secondary"
          pending={pauseSync.isPending}
        />
      ) : (
        <ActionButton
          action={handleResumeSync}
          title={translate('Resume sync')}
          iconNode={<PlayIcon weight="bold" />}
          variant="secondary"
          pending={resumeSync.isPending}
        />
      )}
      <ActionButton
        action={handleEdit}
        title={translate('Edit')}
        iconNode={<PencilSimpleIcon weight="bold" />}
        variant="secondary"
      />
      <ActionButton
        action={handleDelete}
        title={translate('Delete')}
        iconNode={<TrashIcon weight="bold" />}
        variant="danger"
        pending={deleteSettings.isPending}
      />
    </div>
  );
};
