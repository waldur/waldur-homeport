import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { openModalDialog } from '@/modal/actions';

const CampaignUpdateDialog = lazyComponent(() =>
  import('./CampaignUpdateDialog').then((module) => ({
    default: module.CampaignUpdateDialog,
  })),
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
  return <CompactEditButton onClick={callback} />;
};
