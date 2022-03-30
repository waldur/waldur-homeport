import { Container } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceCreateExpandableRow = ({ row }) => (
  <Container>
    <Field label={translate('Resource name')} value={row.name} />
    <Field label={translate('Description')} value={row.description} />
    {row.end_date &&
      ENV.plugins.WALDUR_MARKETPLACE.ENABLE_RESOURCE_END_DATE && (
        <Field
          label={translate('Termination date')}
          value={formatDate(row.end_date)}
        />
      )}
  </Container>
);
