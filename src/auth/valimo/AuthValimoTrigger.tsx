import * as React from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/services';
import { openModalDialog } from '@waldur/modal/actions';

import { AuthButtonText } from '../AuthButtonText';

export const AuthValimoTrigger = ({ mode }) => {
  const dispatch = useDispatch();
  const showDialog = () => dispatch(openModalDialog('authValimoDialog'));
  const provider = ENV.plugins.WALDUR_AUTH_VALIMO.LABEL;

  return (
    <div className="m-b-sm">
      <button
        type="submit"
        className="btn btn-mid btn-block"
        onClick={showDialog}
      >
        <i className="fa fa-phone-square" aria-hidden="true" />{' '}
        <AuthButtonText mode={mode} provider={provider} />
      </button>
    </div>
  );
};
