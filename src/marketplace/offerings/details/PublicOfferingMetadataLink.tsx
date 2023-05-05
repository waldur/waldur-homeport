import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const PublicOfferingMetadataDialog = lazyComponent(
  () => import('./PublicOfferingMetadataDialog'),
  'PublicOfferingMetadataDialog',
);

const showMetadata = () =>
  openModalDialog(PublicOfferingMetadataDialog, {
    resolve: 'Offering metadata details',
    size: 'lg',
  });

export const PublicOfferingMetadataLink = () => {
  const dispatch = useDispatch();

  return (
    <a className="text-link" onClick={() => dispatch(showMetadata())}>
      {translate('Show metadata')}
    </a>
  );
};
