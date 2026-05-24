import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
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
}

interface FormData {
  role: string;
  flavor: OpenStackFlavor;
  system_volume_size: number;
  system_volume_type: string;
  data_volumes: any[];
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
  subnet: formData.attributes?.subnet,
  flavor: formData.flavor?.url,
  system_volume_size: formData.system_volume_size * 1024,
  system_volume_type: formData.system_volume_type,
  data_volumes: (formData.data_volumes || []).map(serializeDataVolume),
});

export const CreateNodeDialog: FC<OwnProps> = (props) => {
  const cluster = props.resolve.resource;
  const state = useQuery({
    queryKey: ['CreateNodeDialog', cluster],
    queryFn: () => loadNodeCreateData(cluster),
  });

  const createNodeMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      rancherNodesCreate({ body: serializeNode(cluster, formData) }),
    successMessage: translate('Node has been created.'),
    errorMessage: translate('Unable to create node.'),
  });

  const initialValues = useMemo(
    () => ({
      role: 'worker',
      system_volume_size: 1,
      system_volume_type: state.data?.defaultVolumeType,
      data_volumes: [],
    }),
    [state.data?.defaultVolumeType],
  );

  return (
    <Form
      onSubmit={(values) => createNodeMutation.mutateAsync(values)}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create node')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={state.isLoading || invalid || submitting}
                  submitting={submitting}
                  label={translate('Create node')}
                />
              </>
            }
          >
            {state.isLoading ? (
              <LoadingSpinner />
            ) : state.error ? (
              <p>{translate('Unable to load data.')}</p>
            ) : (
              <>
                <NodeRoleGroup />
                <NodeFlavorGroup options={state.data.flavors} />
                <SubnetGroup options={state.data.subnets} />
                <NodeStorageGroup
                  volumeTypes={state.data.volumeTypes}
                  defaultVolumeType={state.data.defaultVolumeType}
                />
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
