import * as React from 'react';
import { useDispatch } from 'react-redux';

import { openModalDialog } from '@waldur/modal/actions';

import { AuthButtonText } from '../AuthButtonText';

export const AuthSaml2Trigger = ({ mode }) => {
  const dispatch = useDispatch();
  const selectProvider = () => dispatch(openModalDialog('authSaml2Dialog'));

  return (
    <div className="m-b-sm">
      <button
        type="submit"
        className="btn btn-saml2-edu btn-block"
        onClick={selectProvider}
      >
        <i className="fa fa-globe" aria-hidden="true" />{' '}
        <AuthButtonText mode={mode} provider="eduGAIN" />
      </button>
    </div>
  );
};
