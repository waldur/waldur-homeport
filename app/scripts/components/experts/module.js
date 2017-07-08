import expertsService from './experts-service';
import expertProviderDetails from './expert-provider-details';

export default module => {
  module.service('expertsService', expertsService);
  module.component('expertProviderDetails', expertProviderDetails);
};
