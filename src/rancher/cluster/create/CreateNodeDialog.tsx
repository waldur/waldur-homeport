import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';
import { RancherCluster, rancherNodesCreate } from 'waldur-js-client';
import { OpenStackFlavor } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { NodeFlavorGroup } from './NodeFlavorGroup';
import { NodeRoleGroup } from './NodeRoleGroup';
import { NodeStorageGroup } from './NodeStorageGroup';
import { SubnetGroup } from './SubnetGroup';
import { loadNodeCreateData } from './utils';

interface OwnProps {
  resolve: { resource: RancherCluster };
  flavors: any[];
  subnets: any[];
}

interface FormData {
  flavor: OpenStackFlavor;
  system_volume_size: number;
  system_volume_type: string;
  roles: string[];
  attributes: {
    subnet: string;
  };
}

const serializeDataVolume = ({ size, ...volumeRest }) => ({
  ...volumeRest,
  size: size * 1024,
});

const serializeNode = (cluster: RancherCluster, formData) => ({
  cluster: cluster.url,
  role: formData.role,
  subnet: formData.attributes.subnet,
  flavor: formData.flavor.url,
  system_volume_size: formData.system_volume_size * 1024,
  system_volume_type: formData.system_volume_type,
  data_volumes: (formData.data_volumes || []).map(serializeDataVolume),
});

export const CreateNodeDialog = reduxForm<FormData, OwnProps>({
  form: 'RancherNodeCreate',
})((props) => {
  const cluster = props.resolve.resource;
  const state = useAsync(() => loadNodeCreateData(cluster), [cluster]);

  const createNodeMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      rancherNodesCreate({ body: serializeNode(cluster, formData) }),
    successMessage: translate('Node has been created.'),
    errorMessage: translate('Unable to create node.'),
  });

  return (
    <form
      onSubmit={props.handleSubmit((values) =>
        createNodeMutation.mutateAsync(values),
      )}
    >
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
            <NodeRoleGroup />
            <NodeFlavorGroup options={state.value.flavors} />
            <SubnetGroup options={state.value.subnets} />
            <NodeStorageGroup
              volumeTypes={state.value.volumeTypes}
              defaultVolumeType={state.value.defaultVolumeType}
              sm={{ span: 9, offset: 3 }}
            />
          </>
        )}
      </ModalDialog>
    </form>
  );
});
