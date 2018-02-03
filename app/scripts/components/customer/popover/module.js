import customerSummary from './CustomerSummary';
import customerPopover from './customer-popover';
import customerUsersDetailsList from './customer-users-details-list';

export default module => {
  module.component('customerSummary', customerSummary);
  module.component('customerPopover', customerPopover);
  module.component('customerUsersDetailsList', customerUsersDetailsList);
};
