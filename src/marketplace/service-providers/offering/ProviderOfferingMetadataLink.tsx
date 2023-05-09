import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ProviderOfferingMetadataDialog = lazyComponent(
  () => import('./ProviderOfferingMetadataDialog'),
  'ProviderOfferingMetadataDialog',
);

const showMetadata = () =>
  openModalDialog(ProviderOfferingMetadataDialog, {
    resolve: 'Offering metadata details',
    size: 'lg',
  });

export const ProviderOfferingMetadataLink = () => {
  const dispatch = useDispatch();

  return (
    <a className="text-link" onClick={() => dispatch(showMetadata())}>
      {translate('Show metadata')}
    </a>
  );
};
