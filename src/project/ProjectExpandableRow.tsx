import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export interface ExpandableRow {
  label: string;
  value: number | string;
}

interface ProjectExpandableRowProps {
  rows: ExpandableRow[];
}

export const ProjectExpandableRow = (props: ProjectExpandableRowProps) =>
  props.rows.length > 0 ? (
    <dl className="dl-horizontal m-t-sm resource-details-table">
      {props.rows.map((row, index) => (
        <Field
          key={index}
          label={row.label}
          value={row.value}
        />
      ))}
    </dl>
  ) : (
    <p>
      {translate('Project does not have any resources yet.')}
    </p>
  );
