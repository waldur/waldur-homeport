import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { parseValidators } from '@waldur/resource/actions/utils';
import { getUser } from '@waldur/workspace/selectors';

export const VirtualMachineMultiAction = ({
  rows,
  validators,
  apiMethod,
  title,
  iconNode,
  refetch,
}: {
  rows;
  validators;
  apiMethod;
  title;
  iconNode;
  refetch;
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

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

  const callback = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Perform mass action'),
        translate('Are you sure you want to {title} {count} resources?', {
          title,
          count: validVms.length,
        }),
      );
    } catch {
      return;
    }

    Promise.all(validVms.map((vm) => apiMethod(vm.resource_uuid))).then(() => {
      refetch();
    });
  }, [dispatch, validVms, apiMethod, title, refetch]);

  if (vms.length === 0) {
    return null;
  }
  return (
    <ActionItem
      title={title}
      action={callback}
      disabled={validVms.length === 0}
      iconNode={iconNode}
    />
  );
};
