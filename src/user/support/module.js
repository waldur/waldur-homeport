import UserRemovalMessageDialog from './UserRemovalMessageDialog';
import UserEmailChangeCallback from './UserEmailChangeCallback';
import UserEmailChangeDialog from './UserEmailChangeDialog';

export default (module) => {
  module.component('userRemovalMessageDialog', UserRemovalMessageDialog);
  module.component('userEmailChangeDialog', UserEmailChangeDialog);
  module.component('userEmailChangeCallback', UserEmailChangeCallback);
};
