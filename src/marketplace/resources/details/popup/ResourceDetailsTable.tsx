import { FC, useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { FieldWithCopy } from '@/core/FieldWithCopy';
import FormTable from '@/form/FormTable';

import { getTerminatedAt } from '../getTerminatedAt';
import { getResourceSummaryFields } from '../utils';

interface OwnProps {
  resource: Resource;
}

export const ResourceDetailsTable: FC<OwnProps> = ({ resource }) => {
  const fields = useMemo(
    () =>
      getResourceSummaryFields({
        resource,
        include: [
          'name',
          'offering_name',
          'customer_name',
          'project_name',
          'status',
          'created',
          'project_end_date',
          // The table shows empty rows too, so only the one that applies.
          getTerminatedAt(resource) ? 'terminated_at' : 'effective_termination',
        ],
      }),
    [resource],
  );

  return (
    <FormTable hideActions alignTop detailsMode>
      {fields.map((field) => (
        <FormTable.Item
          key={field.name}
          label={field.label}
          value={
            field.hasCopy ? <FieldWithCopy value={field.value} /> : field.value
          }
          tooltip={field.tooltip}
        />
      ))}
    </FormTable>
  );
};
