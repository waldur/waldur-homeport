import { all, fork } from 'redux-saga/effects';

import cartEffects from '../cart/store/effects';
import categoryEffects from '../category/store/effects';
import offeringEffects from '../offerings/store/effects';
import resourcesEffects from '../resources/store/effects';
import serviceProviderEffects from '../service-providers/store/effects';

export default function* () {
  yield all([
    fork(cartEffects),
    fork(categoryEffects),
    fork(offeringEffects),
    fork(resourcesEffects),
    fork(serviceProviderEffects),
  ]);
}
