import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Option } from 'react-select';
import { reduxForm } from 'redux-form';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Flavor } from '@waldur/openstack/openstack-instance/types';
import { connectAngularComponent } from '@waldur/store/connect';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { NodeFlavorGroup } from '../NodeFlavorGroup';
import { NodeRoleGroup } from '../NodeRoleGroup';
import { NodeStorageGroup } from '../NodeStorageGroup';
import { SubnetGroup } from '../SubnetGroup';
import { loadData } from '../utils';

interface OwnProps {
  resolve: { cluster: any };
  flavors: Option[];
  subnets: Option[];
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
  roles: formData.roles.filter(role => role),
  subnet: formData.attributes.subnet,
  flavor: formData.flavor.url,
  system_volume_size: formData.system_volume_size * 1024,
  system_volume_type: formData.system_volume_type,
  data_volumes: (formData.data_volumes || []).map(serializeDataVolume),
});

export const CreateNodeDialog = reduxForm<FormData, OwnProps>({
  form: 'RancherNodeCreate',
})(props => {
  const { call, state } = useQuery(
    loadData,
    props.resolve.cluster.tenant_settings,
  );
  React.useEffect(call, []);

  const dispatch = useDispatch();

  const createNode = React.useCallback(async (formData: FormData) => {
    try {
      await post(
        '/rancher-nodes/',
        serializeNode(props.resolve.cluster, formData),
      );
    } catch (error) {
      const errorMessage = `${translate('Unable to create node.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      return;
    }
    dispatch(showSuccess(translate('Node has been created.')));
    dispatch(closeModalDialog());
  }, []);

  return (
    <form className="form-horizontal" onSubmit={props.handleSubmit(createNode)}>
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
        {state.loading || !state.loaded ? (
          <LoadingSpinner />
        ) : state.error ? (
          <p>{translate('Unable to load data.')}</p>
        ) : (
          <>
            <NodeRoleGroup {...defaultProps} />
            <NodeFlavorGroup options={state.data.flavors} {...defaultProps} />
            <SubnetGroup options={state.data.subnets} {...defaultProps} />
            <NodeStorageGroup
              volumeTypes={state.data.volumeTypes}
              mountPoints={state.data.mountPoints}
              defaultVolumeType={state.data.defaultVolumeType}
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

export default connectAngularComponent(CreateNodeDialog, ['resolve']);
