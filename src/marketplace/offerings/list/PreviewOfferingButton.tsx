import { EyeIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
  const dispatch = useDispatch();

  if (![ACTIVE, PAUSED].includes(row.state)) {
    return null;
  }
  if (isFeatureVisible(MarketplaceFeatures.catalogue_only)) {
    return null;
  }
  return (
    <Dropdown.Item
      as="button"
      onClick={() => {
        dispatch(
          openModalDialog(PreviewOfferingDialog, {
            resolve: { offering: row },
            size: 'lg',
          }),
        );
      }}
    >
      <span className="svg-icon svg-icon-2">
        <EyeIcon weight="bold" />
      </span>
      {translate('Preview order form')}
    </Dropdown.Item>
  );
};
