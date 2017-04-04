import plansService from './plans-service';
import plansList from './plans-list';
import planAgreementApprove from './plan-agreement-approve';
import planAgreementCancel from './plan-agreement-cancel';
import planAgreementsList from './plan-agreements-list';
import planAgreementState from './plan-agreement-state';
import planRoutes from './routes';

export default module => {
  module.service('plansService', plansService);
  module.component('plansList', plansList);
  module.component('planAgreementApprove', planAgreementApprove);
  module.component('planAgreementCancel', planAgreementCancel);
  module.component('planAgreementsList', planAgreementsList);
  module.component('planAgreementState', planAgreementState);
  module.config(planRoutes);
};
