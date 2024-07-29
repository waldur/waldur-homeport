import { reduxForm } from 'redux-form';

import { InvitationStateFilter } from './InvitationStateFilter';

const PureInvitationsFilter = () => <InvitationStateFilter />;

const enhance = reduxForm({
  form: 'InvitationsFilter',
  destroyOnUnmount: false,
});

export const InvitationsFilter = enhance(PureInvitationsFilter);
