import backButton from './back-button';
import expandableIndicator from './expandable-indicator';
import stopPropagation from './stoppropagation';

export default module => {
  module.directive('backButton', backButton);
  module.directive('expandableIndicator', expandableIndicator);
  module.directive('stoppropagation', stopPropagation);
};
