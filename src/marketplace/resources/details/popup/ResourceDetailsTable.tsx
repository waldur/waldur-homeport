import { FC, useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { FieldWithCopy } from '@/core/FieldWithCopy';
import FormTable from '@/form/FormTable';

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
        ],
      }),
    [resource],
  );

  return (
    <FormTable
      hideActions
      alignTop
      detailsMode
      bordered={false}
      className="gy-5"
    >
      {fields.map((field) => (
        <FormTable.Item
          key={field.name}
          label={field.label}
          value={<FieldWithCopy value={field.value} />}
        />
      ))}
    </FormTable>
  );
};
