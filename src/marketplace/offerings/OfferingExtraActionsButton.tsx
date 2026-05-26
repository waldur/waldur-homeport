import { FC } from 'react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { isStaffOrSupport } from '@/workspace/selectors';

import { Offering } from '../types';

import { OfferingVersionHistoryAction } from './actions/OfferingVersionHistoryAction';
import { PreviewOfferingAction } from './actions/PreviewOfferingAction';

interface OfferingExtraActionsButtonProps {
  offering: Offering;
}

export const OfferingExtraActionsButton: FC<
  OfferingExtraActionsButtonProps
> = ({ offering }) => {
  const showVersionHistory = useSelector(isStaffOrSupport);
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
