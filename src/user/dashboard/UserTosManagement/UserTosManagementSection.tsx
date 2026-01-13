import { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  MarketplacePublicOfferingsListData,
  marketplacePublicOfferingsList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { USER_TOS_FILTER_FORM_ID } from '@waldur/user/constants';
import { USER_TOS_MANAGEMENT_TABLE_ID } from '@waldur/user/constants';

import { OfferingTosExpandableRow } from './OfferingTosExpandableRow';
import { UserTosFilters } from './UserTosFilters';

const mapStateToFilter = createSelector(
  getFormValues(USER_TOS_FILTER_FORM_ID),
  (filterValues: any) => {
    const filter: MarketplacePublicOfferingsListData['query'] = {
      has_terms_of_service: true,
      user_has_offering_user: true,
    };

    if (filterValues?.user_has_consent !== undefined) {
      filter.user_has_consent = filterValues.user_has_consent;
    }

    return filter;
  },
);

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
  const filter = useSelector(mapStateToFilter);

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
              <span className="text-success">{translate('Accepted')}</span>
            );
          } else if (row.user_has_consent === false) {
            return (
              <span className="text-danger"> {translate('Not Accepted')}</span>
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
      filters={<UserTosFilters />}
      columns={columns}
      verboseName={translate('offerings')}
      expandableRow={expandableRow}
      hasQuery
      placeholderComponent={
        <div className="text-center py-5">
          <p className="text-muted">
            {translate('No connected offerings with Terms of Service found.')}
          </p>
        </div>
      }
    />
  );
};
