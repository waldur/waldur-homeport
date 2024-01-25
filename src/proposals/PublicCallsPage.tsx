import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { useMarketplacePublicTabs } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { ProposalCall } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { HeroSection } from './HeroSection';
import { PublicCallExpandableRow } from './PublicCallExpandableRow';
import { PublicCallsTablePlaceholder } from './PublicCallsTablePlaceholder';

import './PublicCallsPage.scss';

export const PublicCallsPage: FunctionComponent = () => {
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
              render: ({ row }) => (
                <Link
                  state="public.proposal-public-call"
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
        />
      </div>
    </div>
  );
};