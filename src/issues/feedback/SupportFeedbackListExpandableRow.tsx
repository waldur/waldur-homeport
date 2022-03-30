import { Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

export const SupportFeedbackListExpandableRow = ({ row }) => (
  <Container fluid={true} className="m-t">
    <Field
      label={translate('Comment')}
      value={renderFieldOrDash(row.comment)}
    />
  </Container>
);
