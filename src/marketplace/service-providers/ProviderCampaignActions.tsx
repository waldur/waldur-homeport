import { ProviderCampaignUpdateButton } from '@/marketplace/service-providers/ProviderCampaignUpdateButton';
import { useUser, useCustomer } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

export const ProviderCampaignActions = ({ row, fetch }) => {
  const user = useUser();
  const customer = useCustomer();
  const isOwnerOrStaff = checkIsOwnerOrStaff(customer, user);
  if (isOwnerOrStaff) {
    return <ProviderCampaignUpdateButton campaign={row} fetch={fetch} />;
  } else {
    return null;
  }
};
