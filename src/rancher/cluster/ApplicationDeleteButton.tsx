import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';

import { removeApp } from '../api';

export const ApplicationDeleteButton = props => {
  const dispatch = useDispatch();
  const deleteApp = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to delete this application?'),
      );
    } catch {
      return;
    }
    try {
      await removeApp(props.application.project_uuid, props.application.id);
      dispatch(showSuccess('Application has been deleted.'));
    } catch (response) {
      dispatch(showError('Unable to delete application. ' + format(response)));
    }
  };
  const [{ loading }, callback] = useAsyncFn(deleteApp);
  return (
    <ActionButton
      title={translate('Delete')}
      disabled={loading}
      action={callback}
      icon={loading ? 'fa fa-spinner fa-spin m-r-xs' : 'fa fa-trash'}
    />
  );
};
