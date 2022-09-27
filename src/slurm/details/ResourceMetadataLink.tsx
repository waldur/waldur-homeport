import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ResourceMetadataDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceMetadataDialog" */ './ResourceMetadataDialog'
    ),
  'ResourceMetadataDialog',
);

const showMetadata = (resource) =>
  openModalDialog(ResourceMetadataDialog, {
    resolve: { resource },
    size: 'lg',
  });

export const ResourceMetadataLink = ({ resource }) => {
  const dispatch = useDispatch();

  return (
    <a
      className="text-dark text-decoration-underline text-hover-primary"
      onClick={() => dispatch(showMetadata(resource))}
    >
      {translate('Show metadata')}
    </a>
  );
};
