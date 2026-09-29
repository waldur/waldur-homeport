import { useMemo } from 'react';

import { translate } from '@/i18n';

import { DetailsTable } from './DetailsTable';
import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
  DescriptionField,
  StartDateField,
} from './OrderCommonFields';

export const OptionsUpdate = ({
  order,
  offering,
  tableOnly,
}: OrderTypeBasedProps & {
  /** Shown under another order view that already has the common fields. */
  tableOnly?: boolean;
}) => {
  const tableData = useMemo(() => {
    const newOptions = (order.attributes as any)?.new_options;
    const oldOptions = (order.attributes as any)?.old_options || {};
    const labels = (offering as any)?.resource_options?.options || {};
    if (newOptions) {
      // The server stores the whole option set; show what the order changes.
      return Object.keys(newOptions)
        .filter(
          (key) =>
            JSON.stringify(oldOptions[key]) !== JSON.stringify(newOptions[key]),
        )
        .map((key) => ({
          option: labels[key]?.label || key,
          old: oldOptions[key],
          new: newOptions[key],
        }));
    }
    return [];
  }, [order, offering]);

  return (
    <>
      {tableOnly ? null : (
        <>
          <RequestedByField order={order} />
          <RequestCommentField order={order} />
          <StartDateField order={order} />
          <DescriptionField order={order} offering={offering} />
        </>
      )}

      <DetailsTable<(typeof tableData)[0]>
        rows={tableData}
        columns={[
          {
            title: translate('Changed options'),
            render: ({ row }) => row.option,
          },
          {
            title: translate('Old'),
            render: ({ row }) =>
              typeof row.old === 'object' ? JSON.stringify(row.old) : row.old,
          },
          {
            title: translate('New'),
            render: ({ row }) =>
              typeof row.new === 'object' ? JSON.stringify(row.new) : row.new,
          },
        ]}
      />
    </>
  );
};
