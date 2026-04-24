import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { TosViewDialog } from '@waldur/marketplace/offerings/update/tos/shared/TosViewDialog';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

export const ViewTosAction = ({
  tos,
  offering = undefined,
  refetch = undefined,
}) => {
  const dispatch = useDispatch();

  const handleView = () => {
    dispatch(
      openModalDialog(TosViewDialog, {
        resolve: { tos, offering, refetch },
        size: 'lg',
      }),
    );
  };

  return (
    <ActionItem
      title={translate('View ToS')}
      action={handleView}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
