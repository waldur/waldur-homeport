import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

const CampaignDialog = lazyComponent(() =>
  import('./CampaignDialog').then((module) => ({
    default: module.CampaignDialog,
  })),
);

export const ProviderCampaignUpdateButton: FunctionComponent<{
  campaign;
  fetch;
}> = ({ campaign, fetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(CampaignDialog, {
      resolve: { campaign, fetch },
      size: 'lg',
    });
  };
  return <CompactEditButton onClick={callback} />;
};
