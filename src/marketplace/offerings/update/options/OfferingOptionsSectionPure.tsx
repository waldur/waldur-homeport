import { FC, useRef } from 'react';
import { Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../types';

import { AddOptionButton } from './AddOptionButton';
import { FIELD_TYPES } from './constants';
import { DeleteOptionAction } from './DeleteOptionAction';
import { EditOptionAction } from './EditOptionAction';

interface OptionRow {
  name: string;
  type?: string;
  label?: string;
  help_text?: string;
}

const getRows = (data): OptionRow[] =>
  (data?.order || []).map((key) => ({
    ...data.options?.[key],
    name: key,
  }));

const getTypeLabel = (type) =>
  FIELD_TYPES.find((fieldType) => fieldType.value === type)?.label ||
  type ||
  translate('Unknown Type');

export const OfferingOptionsSectionPure: FC<
  Omit<OfferingSectionProps, 'loading'> & {
    title;
    type;
    verboseName: string;
  }
> = (props) => {
  // The rows live inside the offering itself, so a table refresh has to pull a
  // fresh offering first and read the options out of the response.
  const firstFetchRef = useRef(true);

  const tableProps = useTable<OptionRow>({
    // Per offering: the rows are cached by table name, and a shared name
    // showed the previous offering's options until the refetch landed.
    table: `OfferingOptions-${props.type}-${props.offering.uuid}`,
    fetchData: async (request) => {
      let data = props.offering[props.type];
      if (firstFetchRef.current) {
        firstFetchRef.current = false;
      } else {
        const res = await props.refetch();
        data = (res?.data?.offering as Offering)?.[props.type] ?? data;
      }
      return createClientPaginatedFetcher(getRows(data))(request);
    },
  });

  const addButton = (
    <AddOptionButton
      offering={props.offering}
      refetch={tableProps.fetch}
      type={props.type}
    />
  );

  return (
    // One table in the block, so Table draws the card, the title and the
    // action bar and the rows carry no frame of their own.
    <Table<OptionRow>
      {...tableProps}
      rowKey="name"
      title={props.title}
      verboseName={props.verboseName}
      columns={[
        {
          title: translate('Type'),
          render: ({ row }) => getTypeLabel(row.type),
        },
        {
          title: translate('Label'),
          render: ({ row }) => renderFieldOrDash(row.label),
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.help_text),
        },
      ]}
      tableActions={addButton}
      placeholderActions={addButton}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <EditOptionAction
            offering={props.offering}
            option={row}
            type={props.type}
            refetch={tableProps.fetch}
          />
          <DeleteOptionAction
            offering={props.offering}
            optionKey={row.name}
            optionLabel={row.label}
            type={props.type}
            refetch={tableProps.fetch}
          />
        </ActionsDropdown>
      )}
    />
  );
};
