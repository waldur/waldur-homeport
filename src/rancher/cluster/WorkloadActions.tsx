import { SwapIcon, TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';
import {
  rancherWorkloadsDestroy,
  rancherWorkloadsRedeploy,
  rancherWorkloadsYamlRetrieve,
  rancherWorkloadsYamlUpdate,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { deleteEntity } from '@waldur/table/actions';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { ViewYAMLButton } from './ViewYAMLButton';

export const WorkloadActions: FunctionComponent<{ workload }> = ({
  workload,
}) => {
  const dispatch = useDispatch();
  const [redeployResult, redeployCallback] = useAsyncFn(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Redeploy workload'),
        translate(
          'Are you sure you want to redeploy workload {workload}?',
          { workload: <strong>{workload.name}</strong> },
          formatJsxTemplate,
        ),
        {
          positiveButton: translate('Redeploy'),
          negativeButton: translate('Cancel'),
          iconNode: <SwapIcon weight="bold" />,
        },
      );
    } catch {
      return;
    }
    try {
      await rancherWorkloadsRedeploy({ path: { uuid: workload.uuid } });
      dispatch(showSuccess('Workload has been redeployed.'));
    } catch (e) {
      dispatch(showErrorResponse(e, 'Unable to redeploy workload.'));
    }
  }, [dispatch, workload]);

  const [deleteResult, deleteCallback] = useAsyncFn(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete workload'),
        translate(
          'Are you sure you would like to delete workload {workload}?',
          { workload: <strong>{workload.name}</strong> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await rancherWorkloadsDestroy({ path: { uuid: workload.uuid } });
      dispatch(showSuccess('Workload has been deleted.'));
      dispatch(deleteEntity('rancher-workloads', workload.uuid));
    } catch (e) {
      dispatch(showErrorResponse(e, 'Unable to delete workload.'));
    }
  }, [dispatch, workload]);

  const disabled = redeployResult.loading || deleteResult.loading;

  return (
    <ActionsDropdownComponent>
      <ViewYAMLButton
        yamlRetrieve={rancherWorkloadsYamlRetrieve}
        yamlUpdate={rancherWorkloadsYamlUpdate}
        resource={workload}
        disabled={disabled}
      />

      <ActionItem
        title={translate('Redeploy')}
        action={redeployCallback}
        iconNode={<SwapIcon weight="bold" />}
        disabled={disabled}
      />

      <ActionItem
        title={translate('Delete')}
        action={deleteCallback}
        iconNode={<TrashIcon weight="bold" />}
        disabled={disabled}
        className="text-danger"
        iconColor="danger"
      />
    </ActionsDropdownComponent>
  );
};
