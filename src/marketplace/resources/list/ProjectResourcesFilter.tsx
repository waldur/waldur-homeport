import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { OfferingFilter } from './OfferingFilter';
import { OfferingChoice } from './types';

interface OwnProps {
  offerings: OfferingChoice[];
}

interface FormData {
  state: string[];
  offering: OfferingChoice;
}

const PureProjectResourcesFilter = ({ offerings }) => (
  <Row>
    <OfferingFilter options={offerings} />
  </Row>
);

export const ProjectResourcesFilter = reduxForm<FormData, OwnProps>({
  form: 'ProjectResourcesFilter',
})(PureProjectResourcesFilter);
