import { useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { ActionItem } from '@/resource/actions/ActionItem';
import { parseValidators } from '@/resource/actions/utils';
import { useUser } from '@/workspace/hooks';

export const VirtualMachineMultiAction = ({
  rows,
  validators,
  apiMethod,
  title,
  iconNode,
  refetch,
}: {
  rows: Resource[];
  validators;
  apiMethod;
  title;
  iconNode;
  refetch;
}) => {
  const user = useUser();

  const vms = useMemo(
    () => rows.filter((resource) => resource.resource_type === INSTANCE_TYPE),
    [rows],
  );

  const validVms = useMemo(
    () =>
      vms.filter(
        (resource) =>
          !parseValidators(validators, {
            user,
            resource: resource.backend_metadata,
          }),
      ),
    [vms, user, validators],
  );

  const { mutate, isPending } = useBatchMutation<Resource, void>({
    rows: validVms,
    refetch,
    mutationFn: (vm) => apiMethod(vm.resource_uuid),
    successMessage: translate('{title} action has been scheduled.', { title }),
    renderPartialSuccessMessage: (n) =>
      translate('Successfully scheduled {title} for {n} resources.', {
        title,
        n,
      }),
    errorMessage: translate('Unable to schedule {title} action.', { title }),
    renderErrorMessage: (n) =>
      translate('Unable to schedule {title} for {n} resources.', { title, n }),
    confirmation: {
      title: translate('Perform mass action'),
      body: translate('Are you sure you want to {title} {count} resources?', {
        title,
        count: validVms.length,
      }),
    },
  });

  if (vms.length === 0) {
    return null;
  }
  return (
    <ActionItem
      title={title}
      action={mutate}
      disabled={validVms.length === 0 || isPending}
      iconNode={iconNode}
    />
  );
};
