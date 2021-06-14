import { FunctionComponent } from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { getStates, RequestStateFilter } from './RequestStateFilter';

const PureFlowFilter: FunctionComponent = () => (
  <Row style={{ margin: '0' }}>
    <RequestStateFilter />
  </Row>
);

const enhance = reduxForm({
  form: 'FlowListFilter',
  initialValues: {
    state: [getStates()[0]],
  },
});

export const FlowListFilter = enhance(PureFlowFilter);
