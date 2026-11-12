import { useMemo } from 'react';
import { createFetcher } from 'waldur-api-client';
import { translate } from 'waldur-i18n-runtime';
import {
  proposalRequestedOfferingsList,
  RequestedOfferingStates,
} from 'waldur-js-client';
import { Table, useTable } from 'waldur-table';
import { SegmentedControl } from 'waldur-ui';

import { getRequestColumns } from '../columns';
import { PageHeader, useStableColumns } from '../components';
import { Provider } from '../providers';
import { navigate, pageHref, useRoute } from '../router';

const FILTERS: Record<string, RequestedOfferingStates[] | undefined> = {
  waiting: ['requested'],
  accepted: ['accepted'],
  declined: ['canceled'],
  all: undefined,
};

const fetchRequests = createFetcher(proposalRequestedOfferingsList);

/** Every call that asked for one of the provider's offerings. */
export const RequestsPage = ({ provider }: { provider?: Provider }) => {
  const { params } = useRoute();
  const filter = params.get('state') ?? 'waiting';
  const providerUuid = provider?.uuid;
  const tableFilter = useMemo(
    () => ({
      ...(providerUuid ? { provider_uuid: providerUuid } : {}),
      ...(FILTERS[filter] ? { state: FILTERS[filter] } : {}),
      // Newest first, until a column header is clicked.
      o: '-created',
    }),
    [providerUuid, filter],
  );
  const tableProps = useTable({
    // One table per state, so each keeps its own page.
    table: `provider-calls-requests-${filter}`,
    fetchData: fetchRequests,
    filter: tableFilter,
  });
  const columns = useStableColumns(getRequestColumns());

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title={translate('Requests from calls')}
        description={translate(
          'Calls ask to offer your offerings to their applicants. Accepting commits the offering to the amounts the call allows per proposal.',
        )}
      />
      <SegmentedControl
        className="self-start"
        value={filter}
        onValueChange={(value: string) =>
          navigate(pageHref('requests', { state: value }))
        }
        options={[
          { value: 'waiting', label: translate('Waiting for you') },
          { value: 'accepted', label: translate('Accepted') },
          { value: 'declined', label: translate('Declined') },
          { value: 'all', label: translate('All') },
        ]}
      />
      <Table
        {...tableProps}
        columns={columns}
        // The page header names the list.
        hasActionBar={false}
        emptyMessage={
          filter === 'waiting'
            ? translate('No call is waiting for an answer.')
            : translate('No requests here.')
        }
      />
    </div>
  );
};
