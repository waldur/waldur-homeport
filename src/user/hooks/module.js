import hookDetails from './hook-details';
import hooksList from './HooksList';
import hooksService from './hooks-service';
import HookRemoveDialog from './HookRemoveDialog';

import { formatEventTitle } from './utils';

export default module => {
  module.directive('hookDetails', hookDetails);
  module.filter('formatEventTitle', () => formatEventTitle);
  module.component('hookList', hooksList);
  module.component('hookRemoveDialog', HookRemoveDialog);
  module.service('hooksService', hooksService);
};
