import { FC, useMemo } from 'react';
import {
  RequestedOffering,
  proposalProtectedCallsOfferingsList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { UnpreviewableDiscountWarning } from '@/proposals/UnpreviewableDiscountWarning';
import { getCallReadOnlyReason } from '@/proposals/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AddOfferingButton } from './AddOfferingButton';
import { CallOfferingExpandableRow } from './CallOfferingExpandableRow';
import { CallOfferingPurchaseOrderField } from './CallOfferingPurchaseOrderField';
import { CallOfferingRequestStateField } from './CallOfferingRequestStateField';
import { CallOfferingRowActions } from './CallOfferingRowActions';

interface CallOfferingsSectionProps {
  call: Call;
  isReadOnly?: boolean;
}

export const CallOfferingsSection: FC<CallOfferingsSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'CallOfferingsList',
    fetchData: createFetcher(proposalProtectedCallsOfferingsList, {
      path: { uuid: props.call.uuid },
    }),
  });
  const readOnlyReason = props.isReadOnly
    ? getCallReadOnlyReason(props.call)
    : undefined;
  const refetch = tableProps.fetch;
  // The component rules are edited in the row: it needs the call, and a
  // stable identity so an expanded row is not remounted on every render.
  const ExpandableRow = useMemo(
    () =>
      function CallOfferingRow({ row }: { row: RequestedOffering }) {
        return (
          <CallOfferingExpandableRow
            row={row}
            call={props.call}
            refetch={refetch}
            readOnlyReason={readOnlyReason}
          />
        );
      },
    [props.call, refetch, readOnlyReason],
  );

  return (
    <Table<RequestedOffering>
      {...tableProps}
      id="offerings"
      columns={[
        {
          title: translate('Offering name'),
          render: ({ row }) => (
            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
              {row.offering_name}
              <UnpreviewableDiscountWarning
                planComponents={(row.plan_details as any)?.components}
                offeringComponents={row.components as any}
              />
            </span>
          ),
        },
        {
          title: translate('Provider'),
          render: ({ row }) => <>{renderFieldOrDash(row.provider_name)}</>,
        },
        {
          title: translate('Purchase order'),
          render: CallOfferingPurchaseOrderField,
        },
        {
          title: translate('Requested by'),
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)}</>,
        },
        {
          title: translate('Approved by'),
          render: ({ row }) => <>{renderFieldOrDash(row.approved_by_name)}</>,
        },
        {
          title: translate('State'),
          render: CallOfferingRequestStateField,
        },
      ]}
      title={translate('Offerings')}
      subtitle={translate(
        'Expand an offering to set what a proposal may request of each of its components.',
      )}
      verboseName={translate('Offerings')}
      tableActions={
        <AddOfferingButton
          call={props.call}
          refetch={tableProps.fetch}
          disabled={props.isReadOnly}
          tooltip={
            props.isReadOnly ? getCallReadOnlyReason(props.call) : undefined
          }
        />
      }
      expandableRow={ExpandableRow}
      rowActions={({ row }) =>
        props.isReadOnly ? (
          <ActionsDropdown
            disabled
            tooltip={getCallReadOnlyReason(props.call)}
          />
        ) : (
          <CallOfferingRowActions
            row={row}
            callUuid={props.call.uuid}
            refetch={tableProps.fetch}
          />
        )
      }
      showPageSizeSelector
    />
  );
};
