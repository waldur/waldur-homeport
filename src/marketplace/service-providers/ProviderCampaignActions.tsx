import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ProviderCampaignUpdateButton } from '@waldur/marketplace/service-providers/ProviderCampaignUpdateButton';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';

export const ProviderCampaignActions = ({ row, fetch }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  if (isOwnerOrStaff) {
    return (
      <ButtonGroup>
        <ProviderCampaignUpdateButton campaign={row} fetch={fetch} />
      </ButtonGroup>
    );
  } else {
    return null;
  }
};
