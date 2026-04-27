import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  MarketplacePublicOfferingsListData,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { createFetcher } from '@/table/api';
import {
  UserTosFiltersFilter,
  selectUserTosFiltersFilter,
} from '@/table/generated/UserTosFiltersFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { USER_TOS_MANAGEMENT_TABLE_ID } from '@/user/constants';

import { OfferingTosExpandableRow } from './OfferingTosExpandableRow';

const mandatoryFields: MarketplacePublicOfferingsListData['query']['field'] = [
  'uuid',
  'name',
  'customer_name',
  'state',
  'paused_reason',
  'type',
  'thumbnail',
  'image',
  'user_has_consent',
];

export const UserTosManagementSection: FC = () => {
  const formFilters = useSelector(selectUserTosFiltersFilter);

  const filter = useMemo(
    () => ({
      ...formFilters,
      has_terms_of_service: true,
      user_has_offering_user: true,
    }),
    [formFilters],
  );

  const tableProps = useTable({
    table: USER_TOS_MANAGEMENT_TABLE_ID,
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    queryField: 'keyword',
    mandatoryFields,
  });

  const handleMainTableRefetch = useCallback(() => {
    tableProps.fetch();
  }, [tableProps.fetch]);

  const columns = useMemo(
    () => [
      {
        title: translate('Offering'),
        render: ({ row }) => (
          <div className="d-flex align-items-center">
            {row.thumbnail && (
              <img
                src={row.thumbnail}
                alt={row.name}
                className="me-3 tos-thumbnail"
              />
            )}
            <div>
              <div className="fw-bold">{row.name}</div>
              <div className="text-muted small">{row.customer_name}</div>
            </div>
          </div>
        ),
      },
      {
        title: translate('Provider'),
        render: ({ row }) => <>{row.customer_name}</>,
      },
      {
        title: translate('Consent status'),
        render: ({ row }) => {
          if (row.user_has_consent === true) {
            return (
              <StateIndicator
                variant="success"
                label={translate('Accepted')}
                hasBullet
                pill
                outline
              />
            );
          } else if (row.user_has_consent === false) {
            return (
              <StateIndicator
                variant="danger"
                label={translate('Not Accepted')}
                hasBullet
                pill
                outline
              />
            );
          }
          return <span className="text-muted">-</span>;
        },
      },
    ],
    [],
  );

  const expandableRow = useCallback(
    ({ row }) => (
      <OfferingTosExpandableRow
        offering={row}
        onTosAction={handleMainTableRefetch}
      />
    ),
    [handleMainTableRefetch],
  );

  return (
    <Table
      {...tableProps}
      title={translate('Terms of Service management')}
      filters={<UserTosFiltersFilter />}
      columns={columns}
      verboseName={translate('offerings')}
      expandableRow={expandableRow}
      hasQuery
      placeholderComponent={
        <NoResult
          title={translate('No offerings found')}
          message={translate(
            'No connected offerings with Terms of Service found.',
          )}
          noAction
        />
      }
    />
  );
};
