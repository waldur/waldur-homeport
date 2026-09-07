import { EyeIcon } from '@phosphor-icons/react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

import { ACTIVE, PAUSED } from '../store/constants';

const PreviewOfferingDialog = lazyComponent(() =>
  import('./PreviewOfferingDialog').then((module) => ({
    default: module.PreviewOfferingDialog,
  })),
);
export const PreviewOfferingButton = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => {
  const { openDialog } = useModal();

  if (![ACTIVE, PAUSED].includes(row.state)) {
    return null;
  }
  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }
  return (
    <ActionsDropdownItem
      onSelect={() => {
        openDialog(PreviewOfferingDialog, {
          resolve: { offering: row as any },
          size: 'lg',
        });
      }}
    >
      <span className="svg-icon svg-icon-2">
        <EyeIcon weight="bold" />
      </span>
      {translate('Preview order form')}
    </ActionsDropdownItem>
  );
};
