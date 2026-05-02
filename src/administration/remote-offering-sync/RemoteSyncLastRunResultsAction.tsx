import { EyeIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ActionItem } from '@/resource/actions/ActionItem';

import { RemoteSyncActionProps } from './types';

const LastRunResultDialog = ({ remoteSync }) => {
  return (
    <ModalDialog
      title={translate('Result of last run')}
      subtitle={remoteSync.api_url}
      closeButton
    >
      <pre>{remoteSync.last_output || translate('No results to display.')}</pre>
    </ModalDialog>
  );
};

export const RemoteSyncLastRunResultsAction = (
  props: RemoteSyncActionProps,
) => {
  const { openDialog: openModal } = useModal();

  const openDialog = () => {
    openModal(LastRunResultDialog, { remoteSync: props.row });
  };

  return (
    <ActionItem
      title={translate('Show results of last run')}
      action={openDialog}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
