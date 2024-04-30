import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

export const CallOfferingExpandableRow: FunctionComponent<{ row }> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    <Container>
      <Field
        label={translate('Plan')}
        value={renderFieldOrDash(row.plan?.name)}
      />
      {typeof row.attributes?.limits === 'object' &&
        Object.entries(row.attributes.limits).map(
          ([key, value]: [string, string]) => (
            <Field key={key} label={key} value={value} />
          ),
        )}
    </Container>
  </div>
);
