import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getCurrentUser } from '@waldur/user/UsersService';

const PublicOfferingEditor = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicOfferingEditor" */ './PublicOfferingEditor'
    ),
  'PublicOfferingEditor',
);

export const PublicOfferingEditorButton = ({ offering, refreshOffering }) => {
  const dispatch = useDispatch();
  const { value: user } = useAsync(() =>
    getCurrentUser({ __skipLogout__: true }),
  );
  if (!user || !user.is_staff) {
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
