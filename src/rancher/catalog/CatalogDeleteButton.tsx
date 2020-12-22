import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
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

export const CatalogDeleteButton: FunctionComponent<any> = (props) => {
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
