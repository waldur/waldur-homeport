import * as React from 'react';
import { useDispatch } from 'react-redux';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { Resource } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { deleteEntity } from '@waldur/table-react/actions';

import { deleteCatalog } from '../api';

interface OwnProps {
  resolve: {
    catalog: Resource;
  };
}

const useCatalogDeleteDialog = catalog => {
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch();
  const callback = React.useCallback(async () => {
    try {
      setSubmitting(true);
      await deleteCatalog(catalog.uuid);
    } catch (error) {
      const errorMessage = `${translate('Unable to delete catalog.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      setSubmitting(false);
      return;
    }
    dispatch(deleteEntity('rancher-catalogs', catalog.uuid));
    dispatch(showSuccess(translate('Catalog has been deleted.')));
    dispatch(closeModalDialog());
  }, [dispatch, catalog.uuid]);
  return {
    submitting,
    deleteCatalog: callback,
  };
};

export const CatalogDeleteDialog = (props: OwnProps) => {
  const { submitting, deleteCatalog } = useCatalogDeleteDialog(
    props.resolve.catalog,
  );
  return (
    <ActionDialog
      title={translate('Delete catalog')}
      submitLabel={translate('Submit')}
      onSubmit={deleteCatalog}
      submitting={submitting}
    >
      {translate(
        'Are you sure you would like to delete Rancher catalog {catalog}?',
        { catalog: props.resolve.catalog.name },
      )}
    </ActionDialog>
  );
};

export default connectAngularComponent(CatalogDeleteDialog, ['resolve']);
