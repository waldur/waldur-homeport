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

const showMetadata = (resource, scope) =>
  openModalDialog(ResourceMetadataDialog, {
    resolve: { resource, scope },
    size: 'lg',
  });

export const ResourceMetadataLink = ({ resource, scope }) => {
  const dispatch = useDispatch();

  return (
    <a
      className="cursor-pointer text-dark text-decoration-underline text-hover-primary"
      onClick={() => dispatch(showMetadata(resource, scope))}
    >
      {translate('Show metadata')}
    </a>
  );
};
