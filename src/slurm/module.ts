import { connectAngularComponent } from '@waldur/store/connect';

import './actions';
import detailsModule from './details/module';
import { QuotaPie } from './QuotaPie';
import './tabs';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.component('quotaPie', connectAngularComponent(QuotaPie, ['value']));
  detailsModule(module);
};
