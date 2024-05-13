import { PlusCircle } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CampaignCreateDialog = lazyComponent(
  () => import('./CampaignCreateDialog'),
  'CampaignCreateDialog',
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
        size: 'xl',
      }),
    );
  return (
    <ActionButton
      action={callback}
      title={translate('Create')}
      iconNode={<PlusCircle />}
      variant="primary"
    />
  );
};
