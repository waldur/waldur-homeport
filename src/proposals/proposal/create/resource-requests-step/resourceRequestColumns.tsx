import { translate } from '@/i18n';
import {
  formatPrepaidMonths,
  getRequestedPrepaidMonths,
} from '@/proposals/prepaidDuration';
import { PurchaseOrderCell } from '@/proposals/PurchaseOrderCell';
import { getRequestedResourceCost } from '@/proposals/requestedResourceCost';
import { RequestedResourceCostLabel } from '@/proposals/RequestedResourceCostLabel';
import { ProposalResource } from '@/proposals/types';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

/**
 * What a requested resource shows in a list, wherever it is listed.
 *
 * The applicant's form and the reviewer's, manager's and staff's read-only
 * pages render the same rows, and the figures that decide an allocation — the
 * estimated cost, the subscription length, the purchase order — must read the
 * same on each. Provider and category live in the expanded row instead: the
 * progress rail narrows these panels, and six columns pushed what a reviewer
 * is here for behind a sideways scroll.
 */
export const resourceRequestColumns = ({
  offeringFilter,
}: {
  /** Adds the inline offering filter the applicant's table supports. */
  offeringFilter?: boolean;
} = {}): Column<ProposalResource>[] => [
  {
    title: translate('Offering'),
    render: ({ row }) => <>{row.requested_offering.offering_name}</>,
    ...(offeringFilter
      ? {
          filter: 'offering',
          inlineFilter: (row) => ({
            offering_name: row.requested_offering.offering_name,
            offering_uuid: row.requested_offering.offering_uuid,
          }),
        }
      : {}),
  },
  {
    // Estimated, not billed. Recurring and subscription charges get a column
    // each: they are paid differently.
    title: translate('Recurring'),
    render: ({ row }) => (
      <RequestedResourceCostLabel
        cost={getRequestedResourceCost(row)}
        part="monthly"
      />
    ),
  },
  {
    title: translate('Subscription'),
    render: ({ row }) => (
      <RequestedResourceCostLabel
        cost={getRequestedResourceCost(row)}
        part="oneTime"
      />
    ),
  },
  {
    // In a column, so the longest can be seen without expanding rows.
    title: translate('Period'),
    render: ({ row }) => {
      const months = getRequestedPrepaidMonths(row);
      return <>{renderFieldOrDash(months && formatPrepaidMonths(months))}</>;
    },
  },
  {
    title: translate('Purchase order'),
    render: ({ row }) => <PurchaseOrderCell row={row} />,
  },
];
