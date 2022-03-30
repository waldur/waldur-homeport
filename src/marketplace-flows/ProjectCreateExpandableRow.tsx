import { Container } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ProjectCreateExpandableRow = ({ row }) => (
  <Container>
    <Field label={translate('Project name')} value={row.name} />
    <Field label={translate('Description')} value={row.description} />
    {row.end_date && (
      <Field
        label={translate('Termination date')}
        value={formatDate(row.end_date)}
      />
    )}
  </Container>
);
