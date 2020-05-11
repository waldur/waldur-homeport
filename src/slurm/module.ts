import { connectAngularComponent } from '@waldur/store/connect';

import actionConfig from './actions';
import detailsModule from './details/module';
import { QuotaPie } from './QuotaPie';
import SlurmPackagesService from './slurm-packages-service';

import './tabs';
import './provider';
import './register-header';
import './marketplace';

export default module => {
  module.config(actionConfig);
  module.service('SlurmPackagesService', SlurmPackagesService);
  module.component('quotaPie', connectAngularComponent(QuotaPie, ['value']));
  detailsModule(module);
};
