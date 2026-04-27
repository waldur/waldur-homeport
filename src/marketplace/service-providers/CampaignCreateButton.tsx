import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const CampaignCreateDialog = lazyComponent(() =>
  import('./CampaignCreateDialog').then((module) => ({
    default: module.CampaignCreateDialog,
  })),
);

export const CampaignCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openModalDialog(CampaignCreateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
        },
        size: 'lg',
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};
