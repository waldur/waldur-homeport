import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

const createCatalogDialog = cluster =>
  openModalDialog('rancherCatalogCreateDialog', { resolve: { cluster } });

export const CatalogCreateButton = props => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () => dispatch(createCatalogDialog(props.cluster)),
    [dispatch, props.cluster],
  );
  return (
    <ActionButton
      title={translate('Create')}
      action={callback}
      icon="fa fa-plus"
    />
  );
};
