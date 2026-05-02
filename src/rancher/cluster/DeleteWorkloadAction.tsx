import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { rancherWorkloadsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { deleteEntity } from '@/table/actions';

interface DeleteWorkloadActionProps {
  workload: any;
  disabled?: boolean;
}

export const DeleteWorkloadAction: FC<DeleteWorkloadActionProps> = ({
  workload,
  disabled,
}) => {
  const dispatch = useDispatch();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      rancherWorkloadsDestroy({ path: { uuid: workload.uuid } }),
    successMessage: translate('Workload has been deleted.'),
    errorMessage: translate('Unable to delete workload.'),
    onSuccess: () => {
      dispatch(deleteEntity('rancher-workloads', workload.uuid));
    },
    confirmation: {
      title: translate('Delete workload'),
      body: translate(
        'Are you sure you would like to delete workload {workload}?',
        { workload: <strong>{workload.name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={disabled || isPending}
    />
  );
};
