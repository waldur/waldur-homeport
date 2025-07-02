import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  remoteWaldurApiPullOfferingDetails,
  remoteWaldurApiPullOfferingInvoices,
  remoteWaldurApiPullOfferingOrders,
  remoteWaldurApiPullOfferingResources,
  remoteWaldurApiPullOfferingRobotAccounts,
  remoteWaldurApiPullOfferingUsage,
  remoteWaldurApiPullOfferingUsers,
  remoteWaldurApiPushProjectData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  getUser,
  isOwner as isOwnerSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { ActionsDropdown } from '../../actions/ActionsDropdown';

const usePullRemoteOfferingDetails = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingDetails({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Offering details synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering details.'),
          ),
        );
      }
    },
    [dispatch],
  );
};
const usePullRemoteOfferingUsers = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingUsers({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Offering users synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering users.'),
          ),
        );
      }
    },
    [dispatch],
  );
};
const usePushRemoteOfferingProjectData = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPushProjectData({ path: { uuid } });
        dispatch(
          showSuccess(
            translate(
              'Offering project data synchronization has been scheduled.',
            ),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering project data.'),
          ),
        );
      }
    },
    [dispatch],
  );
};
const usePullRemoteOfferingUsage = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingUsage({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Offering usage synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering usage.'),
          ),
        );
      }
    },
    [dispatch],
  );
};
const usePullRemoteOfferingResources = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingResources({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Offering resources synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering resources.'),
          ),
        );
      }
    },
    [dispatch],
  );
};
const usePullRemoteOfferingOrders = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingOrders({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Offering orders synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering orders.'),
          ),
        );
      }
    },
    [dispatch],
  );
};

const usePullRemoteOfferingInvoices = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingInvoices({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Offering invoices synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize offering invoices.'),
          ),
        );
      }
    },
    [dispatch],
  );
};

const usePullRemoteOfferingRobotAccounts = () => {
  const dispatch = useDispatch();

  return useCallback(
    async (uuid: string) => {
      try {
        await remoteWaldurApiPullOfferingRobotAccounts({ path: { uuid } });
        dispatch(
          showSuccess(
            translate('Robot accounts synchronization has been scheduled.'),
          ),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to synchronize robot accounts.'),
          ),
        );
      }
    },
    [dispatch],
  );
};

export const RemoteActions = ({ offering }) => {
  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  const pullRemoteOfferingDetails = usePullRemoteOfferingDetails();
  const pullRemoteOfferingUsers = usePullRemoteOfferingUsers();
  const pushRemoteOfferingProjectData = usePushRemoteOfferingProjectData();
  const pullRemoteOfferingUsage = usePullRemoteOfferingUsage();
  const pullRemoteOfferingResources = usePullRemoteOfferingResources();
  const pullRemoteOfferingOrders = usePullRemoteOfferingOrders();
  const pullRemoteOfferingInvoices = usePullRemoteOfferingInvoices();
  const pullRemoteOfferingRobotAccounts = usePullRemoteOfferingRobotAccounts();
  const isVisible =
    offering.type === REMOTE_OFFERING_TYPE &&
    (user?.is_staff || isOwner || isServiceManager);
  if (!isVisible) {
    return null;
  }
  const actions = [
    {
      label: translate('Pull offering details'),
      handler: () => pullRemoteOfferingDetails(offering.uuid),
    },
    {
      label: translate('Pull offering users'),
      handler: () => pullRemoteOfferingUsers(offering.uuid),
    },
    {
      label: translate('Pull usage'),
      handler: () => pullRemoteOfferingUsage(offering.uuid),
    },
    {
      label: translate('Pull resources'),
      handler: () => pullRemoteOfferingResources(offering.uuid),
    },
    {
      label: translate('Pull orders'),
      handler: () => pullRemoteOfferingOrders(offering.uuid),
    },
    {
      label: translate('Push project data'),
      handler: () => pushRemoteOfferingProjectData(offering.uuid),
    },
    {
      label: translate('Pull resources invoices'),
      handler: () => pullRemoteOfferingInvoices(offering.uuid),
    },
    {
      label: translate('Pull robot accounts'),
      handler: () => pullRemoteOfferingRobotAccounts(offering.uuid),
    },
  ];

  return <ActionsDropdown actions={actions} />;
};
