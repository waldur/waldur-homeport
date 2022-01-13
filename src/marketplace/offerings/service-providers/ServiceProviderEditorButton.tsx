import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const ServiceProviderEditor = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ServiceProviderEditor" */ './ServiceProviderEditor'
    ),
  'ServiceProviderEditor',
);

export const ServiceProviderEditorButton = ({
  provider,
  refreshServiceProvider,
}) => {
  const dispatch = useDispatch();
  const { value: user } = useAsync(() =>
    getCurrentUser({ __skipLogout__: true }),
  );
  dispatch(setCurrentUser(user));
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
          openModalDialog(ServiceProviderEditor, {
            resolve: {
              uuid: provider.uuid,
              image: provider.customer_image,
              customer_uuid: provider.customer_uuid,
              initialValues: { description: provider.description },
              refreshServiceProvider,
            },
            modalStyle: { left: 'auto', bottom: 'auto' },
            formId: 'ServiceProviderEditor',
            dialogClassName: 'sidebarEditor',
          }),
        )
      }
    >
      {translate('Edit')}
    </Button>
  );
};
