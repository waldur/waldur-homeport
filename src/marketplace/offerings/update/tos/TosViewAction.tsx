import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
