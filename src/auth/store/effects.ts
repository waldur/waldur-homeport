import { all, fork } from 'redux-saga/effects';

import saml2Effects from '../saml2/store/effects';

export default function*() {
  yield all([
    fork(saml2Effects),
  ]);
}
