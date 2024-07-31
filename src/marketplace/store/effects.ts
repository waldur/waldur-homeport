import { all, fork } from 'redux-saga/effects';

import offeringEffects from '../offerings/store/effects';
import resourcesEffects from '../resources/store/effects';
import serviceProviderEffects from '../service-providers/store/effects';

export default function* () {
  yield all([
    fork(offeringEffects),
    fork(resourcesEffects),
    fork(serviceProviderEffects),
  ]);
}
