import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { deleteEntity } from '@waldur/table/actions';

import { deleteIngress } from '../api';

import { ViewYAMLButton } from './ViewYAMLButton';

export const IngressActions: FunctionComponent<{ ingress }> = ({ ingress }) => {
  const dispatch = useDispatch();

  const [deleteResult, deleteCallback] = useAsyncFn(async () => {
    try {
      await deleteIngress(ingress.uuid);
      dispatch(showSuccess('Ingress has been deleted.'));
      dispatch(deleteEntity('rancher-ingresses', ingress.uuid));
    } catch (e) {
      dispatch(showErrorResponse(e, 'Unable to delete ingress.'));
    }
  }, [dispatch, ingress]);

  const disabled = deleteResult.loading;

  return (
    <ButtonGroup>
      <ViewYAMLButton resource={ingress} disabled={disabled} />
      <ActionButton
        title={translate('Delete')}
        action={deleteCallback}
        icon="fa fa-trash"
        disabled={disabled}
      />
    </ButtonGroup>
  );
};
