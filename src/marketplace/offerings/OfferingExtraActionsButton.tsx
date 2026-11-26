import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { isSiteAgentOfferingType } from '@/site-agent/constants';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { OfferingStateActions } from './actions/OfferingStateActions';
import { OfferingVersionHistoryAction } from './actions/OfferingVersionHistoryAction';
import { PreviewOfferingAction } from './actions/PreviewOfferingAction';
import { SaveAsTemplateAction } from './actions/SaveAsTemplateAction';
import { ARCHIVED, UNAVAILABLE } from './store/constants';
import { OrderFlowAction } from './update/order-flow/OrderFlowAction';

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
  // Staff land on the offering's own page, not on the list row that also
  // offers it.
  const showSaveAsTemplate = Boolean(
    user?.is_staff && isSiteAgentOfferingType(offering.type),
  );
  const showPreview = !isFeatureVisible(MarketplaceFeatures.catalogue_only);
  const showLifecycle =
    showLifecycleActions &&
    offering.state !== UNAVAILABLE &&
    offering.state !== ARCHIVED;

  // How orders move is a question about the offering's settings, so it is
  // asked where they are edited.
  const showOrderFlow = Boolean(showLifecycleActions);

  if (
    !showPreview &&
    !showVersionHistory &&
    !showSaveAsTemplate &&
    !showOrderFlow &&
    !showLifecycle
  ) {
    return null;
  }

  return (
    <ActionsMenu toggle="labeled" size="lg" variant="tertiary">
      {showPreview && <PreviewOfferingAction offering={offering} />}
      {showVersionHistory && (
        <OfferingVersionHistoryAction offering={offering} />
      )}
      {showSaveAsTemplate && <SaveAsTemplateAction row={offering} />}
      {showOrderFlow && <OrderFlowAction offering={offering} />}
      {showLifecycle &&
        (showPreview ||
          showVersionHistory ||
          showSaveAsTemplate ||
          showOrderFlow) && <Menu.Separator />}
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
