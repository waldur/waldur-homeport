import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

const CampaignUpdateDialog = lazyComponent(() =>
  import('./CampaignUpdateDialog').then((module) => ({
    default: module.CampaignUpdateDialog,
  })),
);

export const ProviderCampaignUpdateButton: FunctionComponent<{
  campaign;
  fetch;
}> = ({ campaign, fetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(CampaignUpdateDialog, {
      resolve: { campaign, fetch },
      size: 'lg',
    });
  };
  return <CompactEditButton onClick={callback} />;
};
