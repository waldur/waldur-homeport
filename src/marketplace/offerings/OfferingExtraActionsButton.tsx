import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { OfferingStateActions } from './actions/OfferingStateActions';
import { OfferingVersionHistoryAction } from './actions/OfferingVersionHistoryAction';
import { PreviewOfferingAction } from './actions/PreviewOfferingAction';
import { ARCHIVED, UNAVAILABLE } from './store/constants';

interface OfferingExtraActionsButtonProps {
  offering: Offering;
  refreshOffering?(): void;
  showLifecycleActions?: boolean;
}

export const OfferingExtraActionsButton: FC<
  OfferingExtraActionsButtonProps
> = ({ offering, refreshOffering, showLifecycleActions }) => {
  const user = useUser();
  const showVersionHistory = user?.is_staff || user?.is_support;
  const showPreview = !isFeatureVisible(MarketplaceFeatures.catalogue_only);
  const showLifecycle =
    showLifecycleActions &&
    offering.state !== UNAVAILABLE &&
    offering.state !== ARCHIVED;

  if (!showPreview && !showVersionHistory && !showLifecycle) {
    return null;
  }

  return (
    <ActionsMenu toggle="labeled" size="lg" variant="tertiary">
      {showPreview && <PreviewOfferingAction offering={offering} />}
      {showVersionHistory && (
        <OfferingVersionHistoryAction offering={offering} />
      )}
      {showLifecycle && (showPreview || showVersionHistory) && (
        <Menu.Separator />
      )}
      {showLifecycle && (
        <OfferingStateActions
          offering={offering}
          refreshOffering={refreshOffering}
          asMenuItems
        />
      )}
    </ActionsMenu>
  );
};
