import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export interface ExpandableRow {
  label: string;
  value: number | string;
}

interface ResourceExpandableRowProps {
  rows: ExpandableRow[];
}

export const ResourceExpandableRow = (props: ResourceExpandableRowProps) =>
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
      {translate('There are no resources yet.')}
    </p>
  );
