import hookDetails from './hook-details';
import hookList from './hook-list';
import formatEventTitle from './hook-filter';
import hooksService from './hooks-service';

export default module => {
  module.directive('hookDetails', hookDetails);
  module.filter('formatEventTitle', formatEventTitle);
  module.directive('hookList', hookList);
  module.service('hooksService', hooksService);
};
