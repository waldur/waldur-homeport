import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  getCustomer,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

const OfferingCreateDialog = lazyComponent(
  () => import('./actions/OfferingCreateDialog'),
  'OfferingCreateDialog',
);

export const CreateOfferingButton = ({ fetch }: { fetch? }) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);

  const callback = () => {
    dispatch(openModalDialog(OfferingCreateDialog, { resolve: { fetch } }));
  };

  if (customer?.is_service_provider && isOwnerOrStaff) {
    return (
      <Button className="btn btn-success btn-md" onClick={callback}>
        <i className="fa fa-plus" /> {translate('Add new offering')}
      </Button>
    );
  } else {
    return null;
  }
};
