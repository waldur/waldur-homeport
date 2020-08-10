import * as React from 'react';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table/ActionButton';
import { deleteEntity } from '@waldur/table/actions';

import { redeployWorkload, deleteWorkload } from '../api';

import { ViewYAMLButton } from './ViewYAMLButton';

export const WorkloadActions = ({ workload }) => {
  const dispatch = useDispatch();
  const [redeployResult, redeployCallback] = useAsyncFn(async () => {
    try {
      await redeployWorkload(workload.uuid);
      dispatch(showSuccess('Workload has been redeployed.'));
    } catch (e) {
      dispatch(showErrorResponse(e, 'Unable to redeploy workload.'));
    }
  }, [dispatch, workload]);

  const [deleteResult, deleteCallback] = useAsyncFn(async () => {
    try {
      await deleteWorkload(workload.uuid);
      dispatch(showSuccess('Workload has been deleted.'));
      dispatch(deleteEntity('rancher-workloads', workload.uuid));
    } catch (e) {
      dispatch(showErrorResponse(e, 'Unable to delete workload.'));
    }
  }, [dispatch, workload]);

  const disabled = redeployResult.loading || deleteResult.loading;

  return (
    <ButtonGroup>
      <ViewYAMLButton resource={workload} disabled={disabled} />
      <ActionButton
        title={translate('Redeploy')}
        action={redeployCallback}
        icon="fa fa-retweet"
        disabled={disabled}
      />
      <ActionButton
        title={translate('Delete')}
        action={deleteCallback}
        icon="fa fa-trash"
        disabled={disabled}
      />
    </ButtonGroup>
  );
};
