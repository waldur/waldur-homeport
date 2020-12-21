import { EventInput } from '@fullcalendar/core';
import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { renderFieldOrDash } from '@waldur/table/utils';

interface DetailedInfo {
  row: {
    uuid: string;
    state: string;
    attributes: {
      schedules: EventInput[];
    };
    project_name: string;
    project_description: string;
    description: string;
    created: string;
  };
}

export const BookingsListExpandableRow: FunctionComponent<DetailedInfo> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    <ResourceDetailsTable>
      <Field
        label={translate('Created')}
        value={renderFieldOrDash(formatDateTime(row.created))}
      />
      <Field
        label={translate('Project')}
        value={renderFieldOrDash(row.project_name)}
      />
      <Field
        label={translate('Project description')}
        value={renderFieldOrDash(row.project_description)}
      />
      <Field
        label={translate('Booking description')}
        value={renderFieldOrDash(row.description)}
      />
    </ResourceDetailsTable>
  </div>
);
