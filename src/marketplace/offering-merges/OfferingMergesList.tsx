import { GitMergeIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { marketplaceOfferingMergesList, OfferingMerge } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  MarketplaceOfferingMergesFilter,
  selectMarketplaceOfferingMergesFilter,
} from '@/table/generated/MarketplaceOfferingMergesFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { DeleteMergeAction, OpenMergeAction, UndoMergeAction } from './actions';
import { DETAILS_STATE, MERGES_TABLE_ID, WIZARD_STATE } from './constants';
import { useCanManageMerges } from './hooks';
import { OfferingMergeStateBadge } from './OfferingMergeStateBadge';
import { RESOURCE_COUNT_KEY } from './utils';

const OfferingLink: FC<{ uuid: string; name: string }> = ({ uuid, name }) => (
  <Link
    state="admin-marketplace-offering-details"
    params={{ offering_uuid: uuid }}
  >
    {name}
  </Link>
);

const MergeSummary: FC<{ row: OfferingMerge }> = ({ row }) => {
  const resources = row.preview?.counts?.[RESOURCE_COUNT_KEY];
  const verification = row.verification;
  if (resources === undefined && !verification) {
    return <>{renderFieldOrDash(null)}</>;
  }
  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      {resources !== undefined && (
        <span>{translate('{count} resource(s)', { count: resources })}</span>
      )}
      {verification && (
        <StateIndicator
          label={
            verification.passed
              ? translate('Verified')
              : translate('Verification failed')
          }
          variant={verification.passed ? 'success' : 'danger'}
          tone="light"
          shape="pill"
        />
      )}
    </div>
  );
};

const NewMergeButton: FC = () => {
  const router = useRouter();
  const canManage = useCanManageMerges();
  if (!canManage) {
    return null;
  }
  return (
    <ActionButton
      title={translate('New merge')}
      iconNode={<GitMergeIcon weight="bold" />}
      variant="primary"
      action={() => router.stateService.go(WIZARD_STATE)}
    />
  );
};

export const OfferingMergesList: FC = () => {
  const filterValues = useFilterValues(MERGES_TABLE_ID);
  const filter = useMemo(
    () => selectMarketplaceOfferingMergesFilter(filterValues),
    [filterValues],
  );
  const tableProps = useTable({
    table: MERGES_TABLE_ID,
    fetchData: createFetcher(marketplaceOfferingMergesList),
    filter,
    syncFiltersToURL: true,
  });

  return (
    <Table<OfferingMerge>
      {...tableProps}
      title={translate('Offering merges')}
      verboseName={translate('offering merges')}
      filters={<MarketplaceOfferingMergesFilter />}
      tableActions={<NewMergeButton />}
      columns={[
        {
          title: translate('Created'),
          render: ({ row }) => (
            <Link state={DETAILS_STATE} params={{ merge_uuid: row.uuid }}>
              {formatDateTime(row.created)}
            </Link>
          ),
        },
        {
          title: translate('Created by'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.created_by_full_name)}</>
          ),
        },
        {
          title: translate('Sources'),
          render: ({ row }) => (
            <div className="d-flex flex-column">
              {row.source_offerings.map((offering) => (
                <OfferingLink
                  key={offering.uuid}
                  uuid={offering.uuid}
                  name={offering.name}
                />
              ))}
            </div>
          ),
        },
        {
          title: translate('Target'),
          render: ({ row }) =>
            row.target_offering ? (
              <OfferingLink
                uuid={row.target_offering.uuid}
                name={row.target_offering.name}
              />
            ) : (
              <>{renderFieldOrDash(null)}</>
            ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <OfferingMergeStateBadge state={row.state} />,
        },
        {
          title: translate('Summary'),
          render: MergeSummary,
        },
      ]}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <OpenMergeAction row={row} />
          <UndoMergeAction row={row} refetch={tableProps.fetch} />
          <DeleteMergeAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
    />
  );
};
