import { FunctionComponent } from 'react';
import { useTitle } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { ProposalCall } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { HeroSection } from './HeroSection';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { PublicCallsTablePlaceholder } from './PublicCallsTablePlaceholder';

import './ProposalPublicCallsPage.scss';

export const ProposalPublicCallsPage: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('Marketplace'));

  useMarketplacePublicTabs();

  const tableProps = useTable({
    table: 'PublicCallsList',
    fetchData: createFetcher('proposal-public-calls'),
    queryField: 'name',
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
              render: ({ row }) => <>{row.name}</>,
            },
            {
              title: translate('Organization'),
              render: ({ row }) => <>{row.customer_name}</>,
            },
            {
              title: translate('Start'),
              orderField: 'start_time',
              render: ({ row }) => (
                <>{renderFieldOrDash(formatDateTime(row.start_time))}</>
              ),
            },
            {
              title: translate('End'),
              orderField: 'end_time',
              render: ({ row }) => (
                <>{renderFieldOrDash(formatDateTime(row.end_time))}</>
              ),
            },
            {
              title: translate('State'),
              orderField: 'state',
              render: ({ row }) => <>{row.state}</>,
            },
          ]}
          verboseName={translate('Public calls')}
          initialSorting={{ field: 'end_time', mode: 'desc' }}
          hasQuery={true}
          placeholderComponent={<PublicCallsTablePlaceholder />}
          expandableRow={PublicCallExpandableRow}
        />
      </div>
    </div>
  );
};
