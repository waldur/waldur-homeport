import { EyeIcon } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { TosViewDialog } from './shared/TosViewDialog';

export const TosViewAction = ({ row }) => {
  const { openDialog } = useModal();

  const handleView = () => {
    openDialog(TosViewDialog, {
      resolve: { tos: row },
      size: 'lg',
    });
  };

  return (
    <ActionItem
      title={translate('View')}
      action={handleView}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
