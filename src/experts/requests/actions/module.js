import expertRequestActions from './expert-request-actions';
import expertRequestCancel from './expert-request-cancel';
import expertRequestComplete from './expert-request-complete';
import expertRequestComplain from './expert-request-complain';

export default module => {
  module.component('expertRequestActions', expertRequestActions);
  module.component('expertRequestCancel', expertRequestCancel);
  module.component('expertRequestComplete', expertRequestComplete);
  module.component('expertRequestComplain', expertRequestComplain);
};
