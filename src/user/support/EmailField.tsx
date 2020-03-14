import * as React from 'react';
import { useState } from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/coreSaga';

import { RequestedEmail } from './RequestedEmail';

export const EmailField = props => {
  const [waiting, setWaiting] = useState(false);
  const dispatch = useDispatch();
  const openChangeDialog = React.useCallback(() => {
    dispatch(
      openModalDialog('userEmailChangeDialog', {
        resolve: { user: props.user },
      }),
    );
  }, []);
  const cancelRequest = React.useCallback(async () => {
    try {
      setWaiting(true);
      await post(`/users/${props.user.uuid}/cancel_change_email/`, {
        user: props.user,
      });
    } catch (error) {
      setWaiting(false);
      const errorMessage = `${translate('Unable to cancel request.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      return;
    }
    setWaiting(false);
    dispatch(
      showSuccess(translate('Email change request has been cancelled.')),
    );
  }, []);

  return (
    <>
      <div className="form-group">
        <label className="col-sm-3 col-md-4 col-lg-3 control-label">
          {translate('Email')}
        </label>
        <div className="col-sm-9 col-md-8">
          <p className="form-control-static">{props.user.email}</p>
          {!props.user.requested_email && !props.protected && (
            <Button onClick={openChangeDialog}>
              {translate('Change email')}
            </Button>
          )}
        </div>
      </div>
      {props.user.requested_email && !props.protected && (
        <RequestedEmail
          requestedEmail={props.user.requested_email}
          onCancelRequest={cancelRequest}
          waiting={waiting}
        />
      )}
    </>
  );
};
