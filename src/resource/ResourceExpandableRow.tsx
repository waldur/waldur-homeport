import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { ResourceDetailsTable } from './summary/ResourceDetailsTable';

export interface ExpandableRow {
  label: string;
  value: number | string;
}

interface ResourceExpandableRowProps {
  rows: ExpandableRow[];
}

export const ResourceExpandableRow: FunctionComponent<ResourceExpandableRowProps> = (
  props,
) =>
  props.rows.length > 0 ? (
    <ResourceDetailsTable>
      {props.rows.map((row, index) => (
        <Field key={index} label={row.label} value={row.value} />
      ))}
    </ResourceDetailsTable>
  ) : (
    <p>{translate('There are no resources yet.')}</p>
  );
