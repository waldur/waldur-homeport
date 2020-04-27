import hookDetails from './hook-details';
import HookRemoveDialog from './HookRemoveDialog';
import hooksService from './hooks-service';
import { formatEventTitle } from './utils';

export default module => {
  module.directive('hookDetails', hookDetails);
  module.filter('formatEventTitle', () => formatEventTitle);
  module.component('hookRemoveDialog', HookRemoveDialog);
  module.service('hooksService', hooksService);
};
