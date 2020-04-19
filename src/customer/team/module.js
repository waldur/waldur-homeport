import { connectAngularComponent } from '@waldur/store/connect';

import addTeamMember from './add-team-member';
import { CustomerTeam } from './CustomerTeam';

export default module => {
  module.component('customerTeam', connectAngularComponent(CustomerTeam));
  module.component('addTeamMember', addTeamMember);
};
