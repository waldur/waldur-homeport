import { useMemo } from 'react';

import { translate } from '@waldur/i18n';

import { DetailsTable } from './DetailsTable';
import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
  DescriptionField,
  StartDateField,
} from './OrderCommonFields';

export const OptionsUpdate = ({ order, offering }: OrderTypeBasedProps) => {
  const tableData = useMemo(() => {
    const newOptions = (order.attributes as any)?.new_options;
    const oldOptions = (order.attributes as any)?.old_options;
    if (newOptions) {
      return Object.keys(newOptions).map((key) => ({
        option: key,
        old: oldOptions[key],
        new: newOptions[key],
      }));
    }
    return [];
  }, [order]);

  return (
    <>
      <RequestedByField order={order} />
      <RequestCommentField order={order} />
      <StartDateField order={order} />
      <DescriptionField order={order} offering={offering} />

      <DetailsTable<(typeof tableData)[0]>
        rows={tableData}
        columns={[
          {
            title: translate('Changed options'),
            render: ({ row }) => row.option,
          },
          {
            title: translate('Old'),
            render: ({ row }) => row.old,
          },
          {
            title: translate('New'),
            render: ({ row }) => row.new,
          },
        ]}
      />
    </>
  );
};
