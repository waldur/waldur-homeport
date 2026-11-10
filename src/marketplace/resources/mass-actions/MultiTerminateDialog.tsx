import { FC } from 'react';
import { marketplaceResourcesTerminate, Resource } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { DestroyInstanceParams } from '@/openstack/api';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { getDeleteField } from '@/openstack/openstack-instance/actions/utils';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

interface MultiTerminateDialogProps {
  resolve: {
    rows: Resource[];
    refetch?(): void;
  };
}

const isInstance = (resource: Resource) =>
  resource.resource_type === INSTANCE_TYPE;

const TerminationSummary = ({ count, instanceCount }) => (
  <p className="mb-3">
    {translate('Are you sure you want to terminate {count} resources?', {
      count,
    })}
    {instanceCount < count && (
      <>
        {' '}
        {translate(
          'The options below apply only to OpenStack instances ({count} of the selected resources).',
          { count: instanceCount },
        )}
      </>
    )}
  </p>
);

const InstancesTerminationWarning = () => (
  <AlertItem
    type="floating"
    variant="warning"
    title={translate('Warning')}
    body={translate(
      'Running instances will be stopped. Existing backups and volume snapshots of the instances will be deleted.',
    )}
    className="mb-3"
  />
);

/** Batch termination for a selection that holds OpenStack instances: asks,
 * as the single-instance DestroyDialog does, whether to delete their volumes
 * and release their floating IPs. Without these attributes the backend
 * deletes and releases both. */
export const MultiTerminateDialog: FC<MultiTerminateDialogProps> = ({
  resolve: { rows, refetch },
}) => {
  const { closeDialog } = useModal();
  const instanceCount = rows.filter(isInstance).length;

  const mutation = useBatchMutation<Resource, DestroyInstanceParams>({
    rows,
    refetch,
    mutationFn: (resource, formData) =>
      marketplaceResourcesTerminate({
        path: { uuid: resource.uuid },
        // Other resource types keep the request they always sent.
        ...(isInstance(resource)
          ? {
              body: {
                attributes: {
                  delete_volumes: formData.delete_volumes,
                  release_floating_ips: formData.release_floating_ips,
                },
              },
            }
          : {}),
      }),
    successMessage: translate('Resources have been terminated.'),
    renderPartialSuccessMessage: (n) =>
      translate('{n} resources have been terminated.', { n }),
    renderErrorMessage: (n) =>
      translate('{n} resources could not be terminated.', { n }),
  });

  // Resource list rows carry no floating IPs, so both options are shown.
  const { formFields, initialValues } = getDeleteField({});

  return (
    <ResourceActionDialog
      dialogTitle={translate('Terminate resources')}
      dialogSubtitle={translate('{count} resources selected', {
        count: rows.length,
      })}
      dialogSubmitLabel={translate('Terminate')}
      dialogSubmitVariant="danger"
      formFields={[
        {
          name: 'termination_summary',
          component: TerminationSummary,
          extraProps: { count: rows.length, instanceCount },
        },
        {
          name: 'termination_warning',
          component: InstancesTerminationWarning,
        },
        ...formFields,
      ]}
      initialValues={initialValues}
      // The batch mutation reports failures. Close anyway, as the plain
      // confirmation does: the rows that went through already have orders,
      // so submitting the same rows again would only fail for them.
      submitForm={(formData) =>
        mutation.mutateAsync(formData).catch(() => closeDialog())
      }
    />
  );
};
