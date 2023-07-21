import { useSelector } from 'react-redux';

import { isOwnerOrStaff, isSupportOnly } from '@waldur/workspace/selectors';

import { OfferingEditActions } from './actions/OfferingEditActions';

export const OfferingActions = ({ row, fetch }) => {
  const actionsEnabled = useSelector(isOwnerOrStaff);
  const hideOfferingItemActions = useSelector(isSupportOnly);
  if (!actionsEnabled || hideOfferingItemActions) {
    return null;
  }
  return <OfferingEditActions offering={row} refreshOffering={fetch} />;
};
