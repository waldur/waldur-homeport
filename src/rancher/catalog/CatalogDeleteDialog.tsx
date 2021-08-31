import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { Resource } from '@waldur/resource/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { deleteEntity } from '@waldur/table/actions';

import { deleteCatalog } from '../api';

interface OwnProps {
  resolve: {
    catalog: Resource;
  };
}

const useCatalogDeleteDialog = (catalog) => {
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const callback = useCallback(async () => {
    try {
      setSubmitting(true);
      await deleteCatalog(catalog.uuid);
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete catalog.')),
      );
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

export const CatalogDeleteDialog: FunctionComponent<OwnProps> = (props) => {
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
