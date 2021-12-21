import { reduxForm } from 'redux-form';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const enhance = reduxForm({
  form: 'ProjectUpdateRequestListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
});

export const ProjectUpdateRequestListFilter = enhance(RequestStateFilter);
