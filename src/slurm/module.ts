import { connectAngularComponent } from '@waldur/store/connect';

import './actions';
import detailsModule from './details/module';
import { QuotaPie } from './QuotaPie';
import SlurmPackagesService from './slurm-packages-service';
import './tabs';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.service('SlurmPackagesService', SlurmPackagesService);
  module.component('quotaPie', connectAngularComponent(QuotaPie, ['value']));
  detailsModule(module);
};
