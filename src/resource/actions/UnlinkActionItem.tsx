import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { formatResourceType } from '../utils';

import { ActionItem } from './ActionItem';

const getConfirmationText = (resource) => {
  const context = {
    name: resource.name.toUpperCase(),
    resourceType: formatResourceType(resource) || 'resource',
  };
  return translate(
    'Are you sure you want to unlink {name} {resourceType}? ',
    context,
  );
};

export const UnlinkActionItem: FC<{ resource }> = ({ resource }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  if (!user.is_staff) {
    return null;
  }
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Unlink resource'),
        getConfirmationText(resource),
      );
    } catch {
      return;
    }

    try {
      await post(`${resource.url}unlink/`);
      dispatch(showSuccess(translate('Resource has been unlinked.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to unlink resource.')));
    }
  };
  return (
    <ActionItem
      title={translate('Unlink')}
      action={callback}
      className="text-danger"
    />
  );
};
