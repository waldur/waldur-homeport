import * as React from 'react';
import { useDispatch } from 'react-redux';

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
  return (
    <ActionButton
      title={translate('Delete')}
      action={callback}
      icon="fa fa-trash"
    />
  );
};
