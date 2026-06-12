import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { OfferingVersionHistoryAction } from './actions/OfferingVersionHistoryAction';
import { PreviewOfferingAction } from './actions/PreviewOfferingAction';

interface OfferingExtraActionsButtonProps {
  offering: Offering;
}

export const OfferingExtraActionsButton: FC<
  OfferingExtraActionsButtonProps
> = ({ offering }) => {
  const user = useUser();
  const showVersionHistory = user?.is_staff || user?.is_support;
  const showPreview = !isFeatureVisible(MarketplaceFeatures.catalogue_only);

  if (!showPreview && !showVersionHistory) {
    return null;
  }

  return (
    <ActionsDropdownComponent labeled size="lg" variant="tertiary">
      {showPreview && <PreviewOfferingAction offering={offering} />}
      {showVersionHistory && (
        <OfferingVersionHistoryAction offering={offering} />
      )}
    </ActionsDropdownComponent>
  );
};
