import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import {
  AffiliatedOrganization,
  AffiliatedOrganizationReportRow,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { defaultCurrency } from '@/core/formatCurrency';
import { SummaryWidget } from '@/core/SummaryWidget';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { translate } from '@/i18n';
import { ModalProvider } from '@/modal/ModalContext';
import store from '@/store/store';

import {
  AffiliationCountryTable,
  AffiliationReportTable,
} from './AffiliationTables';
import { buildAffiliationReport } from './useAffiliationReport';

const org = (
  uuid: string,
  name: string,
  code: string,
  country?: string,
): AffiliatedOrganization =>
  ({ uuid, name, code, country, projects_count: 0 }) as AffiliatedOrganization;

const row = (
  org_uuid: string | null,
  org_name: string,
  org_abbreviation: string,
  projects_count: number,
  resources_count: number,
  estimated_cost: string,
): AffiliatedOrganizationReportRow => ({
  org_uuid,
  org_name,
  org_abbreviation,
  projects_count,
  resources_count,
  estimated_cost,
});

// Fed through the real transform, so the figures are what the page computes.
const REPORT = buildAffiliationReport(
  [
    row('cern', 'CERN', 'CERN', 24, 87, '12480.50'),
    row(
      'embl',
      'European Molecular Biology Laboratory',
      'EMBL',
      18,
      61,
      '9240.00',
    ),
    row('ut', 'University of Tartu', 'UT', 15, 52, '7115.75'),
    row('uu', 'Uppsala University', 'UU', 11, 38, '5402.30'),
    row('csc', 'CSC – IT Center for Science', 'CSC', 9, 44, '6880.10'),
    row('dtu', 'Technical University of Denmark', 'DTU', 6, 19, '2940.00'),
    row('ioc', 'Institute of Cybernetics', 'IoC', 4, 12, '1510.25'),
    row(null, 'Unaffiliated', '', 7, 15, '1930.40'),
  ],
  [
    org('cern', 'CERN', 'CERN', 'CH'),
    org('embl', 'European Molecular Biology Laboratory', 'EMBL', 'DE'),
    org('ut', 'University of Tartu', 'UTARTU', 'EE'),
    org('uu', 'Uppsala University', 'UPPSALA', 'SE'),
    org('csc', 'CSC – IT Center for Science', 'CSC', 'FI'),
    org('dtu', 'Technical University of Denmark', 'DTU', 'DK'),
    org('ioc', 'Institute of Cybernetics', 'IOC', 'EE'),
    // Registered but projectless — this is what makes the card footer differ.
    org('desy', 'DESY', 'DESY', 'DE'),
    org('sics', 'RISE SICS', 'SICS', 'SE'),
  ],
);

const ReportPreview = () => {
  // Storybook skips the app bootstrap, so defaultCurrency has no currency.
  ENV.plugins = {
    ...ENV.plugins,
    WALDUR_CORE: { ...ENV.plugins?.WALDUR_CORE, CURRENCY_NAME: 'EUR' },
  } as typeof ENV.plugins;
  const { summary } = REPORT;

  return (
    <Provider store={store}>
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <ModalProvider>
          <DrawerProvider>
            <div className="p-5">
              <SummaryWidget
                stats={[
                  {
                    label: translate('Affiliated organizations'),
                    value: summary.organizations,
                  },
                  {
                    label: translate('Affiliated projects'),
                    value: summary.affiliatedProjects,
                  },
                  {
                    label: translate('Unaffiliated projects'),
                    value: summary.unaffiliatedProjects,
                  },
                  {
                    label: translate('Affiliation coverage'),
                    value: `${summary.coverage.toFixed(1)}%`,
                  },
                  {
                    label: translate('Estimated cost'),
                    value: defaultCurrency(summary.totalCost),
                  },
                ]}
              />

              <AffiliationReportTable rows={REPORT.rows} />

              <div className="mt-5">
                <AffiliationCountryTable rows={REPORT.byCountry} />
              </div>
            </div>
          </DrawerProvider>
        </ModalProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta = {
  title: 'Reporting/Projects by affiliated organization',
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const Default: StoryObj = { render: () => <ReportPreview /> };
