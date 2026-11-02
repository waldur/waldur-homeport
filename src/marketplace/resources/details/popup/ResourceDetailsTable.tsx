import { FC, useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { renderFieldOrDash } from '@/table/utils';

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
    <PropertyList hideActions alignTop detailsMode>
      {fields.map((field) => (
        <PropertyItem
          key={field.name}
          label={field.label}
          value={field.hasCopy ? renderFieldOrDash(field.value) : field.value}
          hasCopy={field.hasCopy}
          tooltip={field.tooltip}
        />
      ))}
    </PropertyList>
  );
};
