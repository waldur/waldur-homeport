import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { CallAllFiltersWithDefaultState } from '@waldur/proposals/call-management/CallAllFilters';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { Call } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { HeroSection } from './HeroSection';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { PublicCallsTablePlaceholder } from './PublicCallsTablePlaceholder';
import { formatCallState } from './utils';

import './PublicCallsPage.scss';

const mapStateToFilter = createSelector(
  getFormValues(CALL_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};

    if (filters) {
      if (filters.state) {
        result.state = filters.state.map((option) => option.value);
      }
    }
    return result;
  },
);

export const PublicCallsPage: FunctionComponent = () => {
  const filter = useSelector(mapStateToFilter);
  useFullPage();
  useTitle(translate('Marketplace'));

  useMarketplacePublicTabs();

  const tableProps = useTable({
    table: 'PublicCallsList',
    fetchData: createFetcher('proposal-public-calls'),
    queryField: 'name',
    filter,
  });

  return (
    <div className="public-calls-page">
      <HeroSection
        title={
          ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE +
          ' ' +
          translate('calls for proposals')
        }
      ></HeroSection>
      <div className="container-xxl mb-20">
        <Table<Call>
          title={translate('Calls for proposals')}
          {...tableProps}
          columns={[
            {
              title: translate('Name'),
              orderField: 'name',
              render: ({ row }) => (
                <Link
                  state="public-calls.details"
                  params={{ uuid: row.uuid }}
                  label={row.name}
                />
              ),
            },
            {
              title: translate('Organization'),
              render: ({ row }) => <>{row.customer_name}</>,
            },
            {
              title: translate('Start'),
              render: ({ row }) => (
                <>{renderFieldOrDash(formatDateTime(row.start_date))}</>
              ),
            },
            {
              title: translate('End'),
              render: ({ row }) => (
                <>{renderFieldOrDash(formatDateTime(row.end_date))}</>
              ),
            },
            {
              title: translate('State'),
              render: ({ row }) => <>{formatCallState(row.state)}</>,
            },
          ]}
          verboseName={translate('Public calls')}
          initialSorting={{ field: 'name', mode: 'desc' }}
          hasQuery={true}
          placeholderComponent={<PublicCallsTablePlaceholder />}
          expandableRow={PublicCallExpandableRow}
          filters={<CallAllFiltersWithDefaultState />}
        />
      </div>
    </div>
  );
};
