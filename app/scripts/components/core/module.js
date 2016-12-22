import attachTracking from './tracking';
import submitButton from './submit-button';

export default module => {
  module.run(attachTracking);
  module.directive('submitButton', submitButton);
};
