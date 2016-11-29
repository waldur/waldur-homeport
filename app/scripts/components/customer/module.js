import { CustomerUtilsService } from './customer-utils';
import customerPopover from './customer-popover';

export default module => {
  module.service('CustomerUtilsService', CustomerUtilsService);
  module.directive('customerPopover', customerPopover);
}
