import expertRequestsService from './expert-requests-service';
import expertRequestState from './expert-request-state';
import billingType from './billing-type';
import actionsModule from './actions/module';
import createModule from './create/module';
import detailsModule from './details/module';
import listModule from './list/module';

export default module => {
  module.service('expertRequestsService', expertRequestsService);
  module.component('billingType', billingType);
  module.component('expertRequestState', expertRequestState);
  actionsModule(module);
  createModule(module);
  detailsModule(module);
  listModule(module);
};
