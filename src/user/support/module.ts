import UserEmailChangeCallback from './UserEmailChangeCallback';
import UserEmailChangeDialog from './UserEmailChangeDialog';
import UserRemovalMessageDialog from './UserRemovalMessageDialog';

export default module => {
  module.component('userRemovalMessageDialog', UserRemovalMessageDialog);
  module.component('userEmailChangeDialog', UserEmailChangeDialog);
  module.component('userEmailChangeCallback', UserEmailChangeCallback);
};
