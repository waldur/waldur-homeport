import { takeEvery, call, put } from 'redux-saga/effects';

import * as api from '@waldur/auth/saml2/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';

import * as actions from './actions';

export function* handleSaml2LoginSaga(action) {
  const provider = action.payload['identity-provider'];
  try {
    /* We support only 2 SAML2 bindings: HTTP redirect and HTTP POST.
     * If HTTP redirect binding is used, we're redirecting user
     * to the URL specified by url field.
     * If HTTP POST binding is used, we're submitting form with
     * SAMLRequest field to URL specified by url field.
     */
    const { data } = yield call(api.loginSaml2, provider.url);
    if (data.binding === 'redirect') {
      window.location.assign(data.url);
    } else if (data.binding === 'post') {
      const { url, request } = data;
      yield call(api.loginSaml2FormData, url, request);
    }
  } catch (error) {
    yield put(actions.loginSaml2.failure(error));
    let errorMessage;
    if (error.status === 400) {
      errorMessage = error.data.error_message;
    } else {
      errorMessage = `${translate('Unable to login via SAML2 protocol.')} ${format(error)}`;
    }
    yield put(showError(errorMessage));
  }
}

export default function*() {
  yield takeEvery(actions.loginSaml2.REQUEST, handleSaml2LoginSaga);
}
