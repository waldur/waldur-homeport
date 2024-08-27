import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

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
  return <EditButton onClick={callback} size="sm" />;
};
