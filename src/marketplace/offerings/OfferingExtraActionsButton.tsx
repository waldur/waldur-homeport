import { ClockCounterClockwiseIcon, EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { isStaffOrSupport } from '@/workspace/selectors';

import { Offering } from '../types';

const PreviewOfferingDialog = lazyComponent(() =>
  import('./list/PreviewOfferingDialog').then((module) => ({
    default: module.PreviewOfferingDialog,
  })),
);

const VersionHistoryDialog = lazyComponent(() =>
  import('@/version-history/VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

interface OfferingExtraActionsButtonProps {
  offering: Offering;
}

export const OfferingExtraActionsButton: FC<
  OfferingExtraActionsButtonProps
> = ({ offering }) => {
  const { openDialog } = useModal();
  const showVersionHistory = useSelector(isStaffOrSupport);
  const showPreview = !isFeatureVisible(MarketplaceFeatures.catalogue_only);

  if (!showPreview && !showVersionHistory) {
    return null;
  }

  return (
    <ActionsDropdownComponent labeled size="lg" variant="tertiary">
      {showPreview && (
        <ActionItem
          title={translate('Preview order form')}
          iconNode={<EyeIcon weight="bold" />}
          action={() =>
            openDialog(PreviewOfferingDialog, {
              resolve: { offering },
              size: 'lg',
            })
          }
        />
      )}
      {showVersionHistory && (
        <ActionItem
          title={translate('Version history')}
          iconNode={<ClockCounterClockwiseIcon weight="bold" />}
          action={() =>
            openDialog(VersionHistoryDialog, {
              size: 'xl',
              entityType: 'offering',
              entityUuid: offering.uuid,
              entityName: offering.name,
            })
          }
        />
      )}
    </ActionsDropdownComponent>
  );
};
