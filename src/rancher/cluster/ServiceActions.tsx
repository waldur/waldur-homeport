import * as React from 'react';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table/ActionButton';
import { deleteEntity } from '@waldur/table/actions';

import { deleteService } from '../api';

import { ViewYAMLButton } from './ViewYAMLButton';

export const ServiceActions = ({ service }) => {
  const dispatch = useDispatch();

  const [deleteResult, deleteCallback] = useAsyncFn(async () => {
    try {
      await deleteService(service.uuid);
      dispatch(showSuccess('Service has been deleted.'));
      dispatch(deleteEntity('rancher-services', service.uuid));
    } catch (e) {
      dispatch(showErrorResponse(e, 'Unable to delete service.'));
    }
  }, [dispatch, service]);

  const disabled = deleteResult.loading;

  return (
    <ButtonGroup>
      <ViewYAMLButton resource={service} disabled={disabled} />
      <ActionButton
        title={translate('Delete')}
        action={deleteCallback}
        icon="fa fa-trash"
        disabled={disabled}
      />
    </ButtonGroup>
  );
};
