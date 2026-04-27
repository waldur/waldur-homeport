import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { TosViewDialog } from './shared/TosViewDialog';

export const TosViewAction = ({ row }) => {
  const dispatch = useDispatch();

  const handleView = () => {
    dispatch(
      openModalDialog(TosViewDialog, {
        resolve: { tos: row },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionItem
      title={translate('View')}
      action={handleView}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
