import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { reduxForm } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Flavor } from '@waldur/openstack/openstack-instance/types';
import { createNode } from '@waldur/rancher/api';
import { Cluster } from '@waldur/rancher/types';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { NodeFlavorGroup } from './NodeFlavorGroup';
import { NodeRoleGroup } from './NodeRoleGroup';
import { NodeStorageGroup } from './NodeStorageGroup';
import { SubnetGroup } from './SubnetGroup';
import { loadData } from './utils';

interface OwnProps {
  resolve: { cluster: any };
  flavors: any[];
  subnets: any[];
}

interface FormData {
  flavor: Flavor;
  system_volume_size: number;
  system_volume_type: string;
  roles: string[];
  attributes: {
    subnet: string;
  };
}

const defaultProps = {
  labelClassName: 'control-label col-sm-3',
  valueClassName: 'col-sm-9',
};

const serializeDataVolume = ({ size, ...volumeRest }) => ({
  ...volumeRest,
  size: size * 1024,
});

const serializeNode = (cluster, formData) => ({
  cluster: cluster.url,
  roles: formData.roles.filter((role) => role),
  subnet: formData.attributes.subnet,
  flavor: formData.flavor.url,
  system_volume_size: formData.system_volume_size * 1024,
  system_volume_type: formData.system_volume_type,
  data_volumes: (formData.data_volumes || []).map(serializeDataVolume),
});

const loadNodeCreateData = async (cluster: Cluster) => {
  const offering = await getOffering(cluster.marketplace_offering_uuid);
  return await loadData(cluster.tenant_settings, offering);
};

export const CreateNodeDialog = reduxForm<FormData, OwnProps>({
  form: 'RancherNodeCreate',
})((props) => {
  const cluster = props.resolve.cluster;
  const state = useAsync(() => loadNodeCreateData(cluster), [cluster]);

  const dispatch = useDispatch();

  const callback = React.useCallback(
    async (formData: FormData) => {
      try {
        await createNode(serializeNode(cluster, formData));
      } catch (error) {
        const errorMessage = `${translate('Unable to create node.')} ${format(
          error,
        )}`;
        dispatch(showError(errorMessage));
        return;
      }
      dispatch(showSuccess(translate('Node has been created.')));
      dispatch(closeModalDialog());
    },
    [dispatch, cluster],
  );

  return (
    <form className="form-horizontal" onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={translate('Create node')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={state.loading || props.invalid || props.submitting}
              submitting={props.submitting}
              label={translate('Create node')}
            />
          </>
        }
      >
        {state.loading ? (
          <LoadingSpinner />
        ) : state.error ? (
          <p>{translate('Unable to load data.')}</p>
        ) : (
          <>
            <NodeRoleGroup {...defaultProps} />
            <NodeFlavorGroup options={state.value.flavors} {...defaultProps} />
            <SubnetGroup options={state.value.subnets} {...defaultProps} />
            <NodeStorageGroup
              volumeTypes={state.value.volumeTypes}
              mountPoints={state.value.mountPoints}
              defaultVolumeType={state.value.defaultVolumeType}
              smOffset={3}
              sm={9}
              {...defaultProps}
            />
          </>
        )}
      </ModalDialog>
    </form>
  );
});
