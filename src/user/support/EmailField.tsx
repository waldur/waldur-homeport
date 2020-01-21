import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { StaticField } from './StaticField';

export const EmailField = props => {
  const dispatch = useDispatch();
  const openChangeDialog = React.useCallback(() => {
    dispatch(openModalDialog('userEmailChangeDialog', {resolve: {user: props.user}}));
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
            <Button onClick={openChangeDialog}>{translate('Change email')}</Button>
          )}
        </div>
      </div>
      {props.user.requested_email && !props.protected && (
        <StaticField
          label={translate('Requested email')}
          value={props.user.requested_email}
        />
      )}
    </>
  );
};
