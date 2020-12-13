import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CatalogDeleteDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CatalogDeleteDialog" */ './CatalogDeleteDialog'
    ),
  'CatalogDeleteDialog',
);

const deleteCatalogDialog = (catalog) =>
  openModalDialog(CatalogDeleteDialog, { resolve: { catalog } });

export const CatalogDeleteButton = (props) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () => dispatch(deleteCatalogDialog(props.catalog)),
    [],
  );
  if (ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Delete')}
      action={callback}
      icon="fa fa-trash"
    />
  );
};
