import { Fragment, FunctionComponent, PropsWithChildren, useMemo } from 'react';
import { Resource } from 'waldur-js-client';

import { FieldWithCopy } from '@/core/FieldWithCopy';
import FormTable from '@/form/FormTable';

import { getResourceSummaryFields } from './utils';

interface ResourceSummaryProps {
  resource: Resource;
  scope: { error_message?; error_traceback? };
}

export const ResourceSummary: FunctionComponent<
  PropsWithChildren<ResourceSummaryProps>
> = ({ resource, scope, children }) => {
  const fields = useMemo(
    () =>
      getResourceSummaryFields({
        resource,
        scope,
        exclude: ['name', 'status'],
      }),
    [resource],
  );

  return (
    <>
      {fields.map((field, i) =>
        field.custom ? (
          <Fragment key={i}>{field.custom}</Fragment>
        ) : field.value ? (
          <FormTable.Item
            key={i}
            label={field.label}
            value={
              field.hasCopy ? (
                <FieldWithCopy value={field.value} />
              ) : (
                field.value
              )
            }
            tooltip={field.tooltip}
            valueClass={field.valueClass}
          />
        ) : null,
      )}
      {children}
    </>
  );
};
