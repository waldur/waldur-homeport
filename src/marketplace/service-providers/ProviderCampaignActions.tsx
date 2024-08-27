import { useSelector } from 'react-redux';

import { ProviderCampaignUpdateButton } from '@waldur/marketplace/service-providers/ProviderCampaignUpdateButton';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

export const ProviderCampaignActions = ({ row, fetch }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  if (isOwnerOrStaff) {
    return <ProviderCampaignUpdateButton campaign={row} fetch={fetch} />;
  } else {
    return null;
  }
};
