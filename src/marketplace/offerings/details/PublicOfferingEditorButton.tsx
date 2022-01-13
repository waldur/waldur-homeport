import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCustomer } from '@waldur/project/api';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentCustomer, setCurrentUser } from '@waldur/workspace/actions';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const PublicOfferingEditor = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicOfferingEditor" */ './PublicOfferingEditor'
    ),
  'PublicOfferingEditor',
);

export const PublicOfferingEditorButton = ({
  offering,
  category,
  refreshOffering,
}) => {
  const dispatch = useDispatch();
  useAsync(async () => {
    const user = await getCurrentUser({ __skipLogout__: true });
    dispatch(setCurrentUser(user));
    if (user) {
      const customer = await getCustomer(offering.customer_uuid);
      dispatch(setCurrentCustomer(customer));
    }
  });
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  if (!(isOwnerOrStaff || isServiceManager)) {
    return null;
  }
  return (
    <Button
      className="m-r-sm"
      onClick={() =>
        dispatch(
          openModalDialog(PublicOfferingEditor, {
            resolve: {
              offering,
              category,
              refreshOffering,
            },
            modalStyle: { left: 'auto', bottom: 'auto' },
            formId: 'PublicOfferingEditor',
            dialogClassName: 'sidebarEditor',
          }),
        )
      }
    >
      {translate('Edit')}
    </Button>
  );
};
