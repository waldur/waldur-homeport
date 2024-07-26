import { reduxForm } from 'redux-form';

import { InvitationStateFilter, choices } from './InvitationStateFilter';

const PureInvitationsFilter = () => <InvitationStateFilter />;

const enhance = reduxForm({
  form: 'InvitationsFilter',
  initialValues: {
    state: [choices[2]],
  },
  destroyOnUnmount: false,
});

export const InvitationsFilter = enhance(PureInvitationsFilter);
