import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { deleteResourceUser } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const DeleteUserButton = ({ user, refetch }) => {
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete user {name}?',
          {
            name: <b>{user.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await deleteResourceUser(user.uuid);
      dispatch(showSuccess(translate('User has been removed.')));
      await refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove user.')));
    }
  };
  return (
    <Button className="btn-sm btn-danger" onClick={handler}>
      {translate('Delete')}
    </Button>
  );
};
