import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import { BookingResource } from './types';

interface DetailedInfo {
  row: BookingResource;
  isServiceProvider: boolean;
}

export const BookingsListExpandableRow: FunctionComponent<DetailedInfo> = ({
  row,
  isServiceProvider,
}) => (
  <div className="container-fluid m-t">
    <Container>
      <Field
        label={translate('Created')}
        value={renderFieldOrDash(formatDateTime(row.created))}
      />
      {isServiceProvider && (
        <Field
          label={translate('Project')}
          value={renderFieldOrDash(row.project_name)}
        />
      )}
      <Field
        label={translate('Project description')}
        value={renderFieldOrDash(row.project_description)}
      />
      <Field
        label={translate('Booking description')}
        value={renderFieldOrDash(row.description)}
      />
    </Container>
  </div>
);
