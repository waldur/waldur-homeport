import {
  formatRegistrationMethod,
  formatLifetime,
  formatUserStatus,
} from './support/utils';

export default module => {
  module.filter('formatRegistrationMethod', () => formatRegistrationMethod);
  module.filter('formatUserStatus', () => formatUserStatus);
  module.filter('formatLifetime', () => formatLifetime);
};
