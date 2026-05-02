import { useSelector } from 'react-redux';
import {
  remoteWaldurApiPullOfferingDetails,
  remoteWaldurApiPullOfferingOrders,
  remoteWaldurApiPullOfferingResources,
  remoteWaldurApiPullOfferingRobotAccounts,
  remoteWaldurApiPullOfferingUsage,
  remoteWaldurApiPullOfferingUsers,
  remoteWaldurApiPushProjectData,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';
import {
  isOwner as isOwnerSelector,
  isServiceManagerSelector,
} from '@/workspace/selectors';

import { ActionsDropdown } from '../../actions/ActionsDropdown';

export const RemoteActions = ({ offering }) => {
  const user = useUser();
  const isOwner = useSelector(isOwnerSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);

  const { mutate: pullRemoteOfferingDetails } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPullOfferingDetails({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering details synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering details.'),
  });

  const { mutate: pullRemoteOfferingUsers } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPullOfferingUsers({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering users synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering users.'),
  });

  const { mutate: pushRemoteOfferingProjectData } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPushProjectData({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering project data synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering project data.'),
  });

  const { mutate: pullRemoteOfferingUsage } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPullOfferingUsage({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering usage synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering usage.'),
  });

  const { mutate: pullRemoteOfferingResources } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPullOfferingResources({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering resources synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering resources.'),
  });

  const { mutate: pullRemoteOfferingOrders } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPullOfferingOrders({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering orders synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering orders.'),
  });

  const { mutate: pullRemoteOfferingRobotAccounts } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      remoteWaldurApiPullOfferingRobotAccounts({
        path: { uuid: offering.uuid },
      }),
    successMessage: translate(
      'Robot accounts synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize robot accounts.'),
  });
  const isVisible =
    offering.type === REMOTE_OFFERING_TYPE &&
    (user?.is_staff || isOwner || isServiceManager);
  if (!isVisible) {
    return null;
  }
  const actions = [
    {
      label: translate('Pull offering details'),
      handler: () => pullRemoteOfferingDetails(),
    },
    {
      label: translate('Pull offering users'),
      handler: () => pullRemoteOfferingUsers(),
    },
    {
      label: translate('Pull usage'),
      handler: () => pullRemoteOfferingUsage(),
    },
    {
      label: translate('Pull resources'),
      handler: () => pullRemoteOfferingResources(),
    },
    {
      label: translate('Pull orders'),
      handler: () => pullRemoteOfferingOrders(),
    },
    {
      label: translate('Push project data'),
      handler: () => pushRemoteOfferingProjectData(),
    },
    {
      label: translate('Pull robot accounts'),
      handler: () => pullRemoteOfferingRobotAccounts(),
    },
  ];

  return <ActionsDropdown actions={actions} />;
};
