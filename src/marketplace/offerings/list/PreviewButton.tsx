import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const PreviewOfferingDialog = lazyComponent(() =>
  import('./PreviewOfferingDialog').then((module) => ({
    default: module.PreviewOfferingDialog,
  })),
);

export const PreviewButton = ({ offering }) => {
  const dispatch = useDispatch();
  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Preview order form')}
      iconNode={<EyeIcon weight="bold" />}
      className="order-1 order-sm-2 w-100 w-sm-auto"
      action={() =>
        dispatch(
          openModalDialog(PreviewOfferingDialog, {
            resolve: { offering },
            size: 'lg',
          }),
        )
      }
    />
  );
};
