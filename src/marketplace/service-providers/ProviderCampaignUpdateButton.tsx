import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const CampaignUpdateDialog = lazyComponent(
  () => import('./CampaignUpdateDialog'),
  'CampaignUpdateDialog',
);

export const ProviderCampaignUpdateButton: FunctionComponent<{
  campaign;
  fetch;
}> = ({ campaign, fetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(CampaignUpdateDialog, {
        resolve: { campaign, fetch },
        size: 'lg',
      }),
    );
  };
  return (
    <RowActionButton
      action={callback}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      size="sm"
    />
  );
};
