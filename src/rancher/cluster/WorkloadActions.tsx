import { Swap, Trash } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';
import { deleteEntity } from '@waldur/table/actions';

import { redeployWorkload, deleteWorkload } from '../api';

import { ViewYAMLButton } from './ViewYAMLButton';

export const WorkloadActions: FunctionComponent<{ workload }> = ({
  workload,
}) => {
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
    <>
      <ViewYAMLButton resource={workload} disabled={disabled} />
      <RowActionButton
        title={translate('Redeploy')}
        action={redeployCallback}
        iconNode={<Swap />}
        disabled={disabled}
        size="sm"
      />
      <RowActionButton
        title={translate('Delete')}
        action={deleteCallback}
        iconNode={<Trash />}
        disabled={disabled}
        size="sm"
      />
    </>
  );
};
