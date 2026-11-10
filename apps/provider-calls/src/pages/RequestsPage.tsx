import { translate } from 'waldur-i18n-runtime';
import { RequestedOfferingStates } from 'waldur-js-client';
import { SegmentedControl } from 'waldur-ui';

import { getRequestColumns } from '../columns';
import { PageHeader, QueryTableCard } from '../components';
import { Provider } from '../providers';
import { useRequestedOfferings } from '../queries';
import { navigate, pageHref, useRoute } from '../router';

const FILTERS: Record<string, RequestedOfferingStates[] | undefined> = {
  waiting: ['requested'],
  accepted: ['accepted'],
  declined: ['canceled'],
  all: undefined,
};

/** Every call that asked for one of the provider's offerings. */
export const RequestsPage = ({ provider }: { provider?: Provider }) => {
  const { params } = useRoute();
  const filter = params.get('state') ?? 'waiting';
  const query = useRequestedOfferings(provider?.uuid, FILTERS[filter]);

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
      <QueryTableCard
        query={query}
        columns={getRequestColumns()}
        rowKey={(row) => row.uuid}
        emptyMessage={
          filter === 'waiting'
            ? translate('No call is waiting for an answer.')
            : translate('No requests here.')
        }
      />
    </div>
  );
};
