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
import { CallAllFilters } from '@waldur/proposals/call-management/CallAllFilters';
import { CALL_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { ProposalCall } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { HeroSection } from './HeroSection';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { PublicCallsTablePlaceholder } from './PublicCallsTablePlaceholder';

import './PublicCallsPage.scss';

const mapPropsToFilter = createSelector(
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
  const filter = useSelector(mapPropsToFilter);
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
          translate('Access calls')
        }
      ></HeroSection>
      <div className="container-xxl mb-20">
        <Table<ProposalCall>
          title={translate('Calls')}
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
                <>{renderFieldOrDash(formatDateTime(row.start_time))}</>
              ),
            },
            {
              title: translate('End'),
              render: ({ row }) => (
                <>{renderFieldOrDash(formatDateTime(row.end_time))}</>
              ),
            },
            {
              title: translate('State'),
              render: ({ row }) => <>{row.state}</>,
            },
          ]}
          verboseName={translate('Public calls')}
          initialSorting={{ field: 'name', mode: 'desc' }}
          hasQuery={true}
          placeholderComponent={<PublicCallsTablePlaceholder />}
          expandableRow={PublicCallExpandableRow}
          filters={<CallAllFilters />}
        />
      </div>
    </div>
  );
};
