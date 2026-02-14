import { ClockCounterClockwiseIcon, EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { Offering } from '../types';

const PreviewOfferingDialog = lazyComponent(() =>
  import('./list/PreviewOfferingDialog').then((module) => ({
    default: module.PreviewOfferingDialog,
  })),
);

const VersionHistoryDialog = lazyComponent(() =>
  import('@waldur/version-history/VersionHistoryDialog').then((module) => ({
    default: module.VersionHistoryDialog,
  })),
);

interface OfferingExtraActionsButtonProps {
  offering: Offering;
}

export const OfferingExtraActionsButton: FC<
  OfferingExtraActionsButtonProps
> = ({ offering }) => {
  const dispatch = useDispatch();
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
            dispatch(
              openModalDialog(PreviewOfferingDialog, {
                resolve: { offering },
                size: 'lg',
              }),
            )
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
