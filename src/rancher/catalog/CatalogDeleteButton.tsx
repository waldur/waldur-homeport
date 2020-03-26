import * as React from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

const deleteCatalogDialog = catalog =>
  openModalDialog('rancherCatalogDeleteDialog', { resolve: { catalog } });

export const CatalogDeleteButton = props => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
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
