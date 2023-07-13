import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { REMOTE_OFFERING_TYPE } from '@waldur/marketplace-remote/constants';
import {
  getUser,
  isOwner as isOwnerSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import { ActionsDropdown } from '../../actions/ActionsDropdown';
import {
  pullRemoteOfferingDetails,
  pullRemoteOfferingInvoices,
  pullRemoteOfferingOrderItems,
  pullRemoteOfferingResources,
  pullRemoteOfferingRobotAccounts,
  pullRemoteOfferingUsage,
  pullRemoteOfferingUsers,
  pushRemoteOfferingProjectData,
} from '../../store/actions';

export const RemoteActions = ({ offering }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  const isVisible =
    offering.type === REMOTE_OFFERING_TYPE &&
    (user?.is_staff || isOwner || isServiceManager);
  if (!isVisible) {
    return null;
  }
  const actions = [
    {
      label: translate('Pull offering details'),
      handler: () => dispatch(pullRemoteOfferingDetails(offering)),
    },
    {
      label: translate('Pull offering users'),
      handler: () => dispatch(pullRemoteOfferingUsers(offering)),
    },
    {
      label: translate('Pull usage'),
      handler: () => dispatch(pullRemoteOfferingUsage(offering)),
    },
    {
      label: translate('Pull resources'),
      handler: () => dispatch(pullRemoteOfferingResources(offering)),
    },
    {
      label: translate('Pull order items'),
      handler: () => dispatch(pullRemoteOfferingOrderItems(offering)),
    },
    {
      label: translate('Push project data'),
      handler: () => dispatch(pushRemoteOfferingProjectData(offering)),
    },
    {
      label: translate('Pull resources invoices'),
      handler: () => dispatch(pullRemoteOfferingInvoices(offering)),
    },
    {
      label: translate('Pull robot accounts'),
      handler: () => dispatch(pullRemoteOfferingRobotAccounts(offering)),
    },
  ];
  return <ActionsDropdown actions={actions} />;
};
