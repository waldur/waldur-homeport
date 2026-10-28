import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { ExportData } from '@/table/exporters/types';
import { formatOrganizationType } from '@/user/support/aai-constants';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';

import { ReportingTitle } from '../ReportingTitle';

import { getCountryLabel } from './affiliationParser';
import { BarChart } from './charts/BarChart';
import { DonutChart } from './charts/DonutChart';
import { useUserStatistics } from './useUserStatistics';

export const UserAnalyticsPage: FC = () => {
  const { data, isLoading, error, refetch } = useUserStatistics();

  const showNationality = isProfileAttributeEnabled('nationality');
  const showCountry = isProfileAttributeEnabled('country_of_residence');
  const showOrgType = isProfileAttributeEnabled('organization_type');
  const showJobTitle = isProfileAttributeEnabled('job_title');

  const nationalityChartData = useMemo(
    () =>
      data?.nationalities?.map((item) => ({
        name: getCountryLabel(item.nationality),
        value: item.count,
      })) || [],
    [data],
  );

  const countryChartData = useMemo(
    () =>
      data?.residenceCountries?.map((item) => ({
        name: getCountryLabel(item.country_of_residence),
        value: item.count,
      })) || [],
    [data],
  );

  const orgTypeChartData = useMemo(
    () =>
      data?.organizationTypes?.map((item) => ({
        name: formatOrganizationType(item.organization_type),
        value: item.count,
      })) || [],
    [data],
  );

  const jobPositionChartData = useMemo(
    () =>
      data?.jobTitles?.map((item) => ({
        name: item.job_title || translate('Unknown'),
        value: item.count,
      })) || [],
    [data],
  );

  const getExportData = (
    title: string,
    chartData: { name: string; value: number }[],
  ): ExportData => ({
    fields: [title, translate('Count')],
    data: chartData.map((item) => [item.name, item.value]),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <ReportingTitle reportKey="user-analytics" />
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'pb-5')}>
        {(showNationality || showCountry) && (
          <div
            className={
              showNationality && showCountry
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'
                : 'grid grid-cols-1 gap-4 mb-4'
            }
          >
            {showNationality && (
              <div>
                <ChartCard
                  title={translate('Users by nationality')}
                  getExportData={() =>
                    getExportData(
                      translate('Nationality'),
                      nationalityChartData,
                    )
                  }
                  isEmpty={nationalityChartData.length === 0}
                >
                  {(ref) => <BarChart ref={ref} data={nationalityChartData} />}
                </ChartCard>
              </div>
            )}
            {showCountry && (
              <div>
                <ChartCard
                  title={translate('Users by country')}
                  getExportData={() =>
                    getExportData(translate('Country'), countryChartData)
                  }
                  isEmpty={countryChartData.length === 0}
                >
                  {(ref) => <BarChart ref={ref} data={countryChartData} />}
                </ChartCard>
              </div>
            )}
          </div>
        )}
        {(showOrgType || showJobTitle) && (
          <div
            className={
              showOrgType && showJobTitle
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'grid grid-cols-1 gap-4'
            }
          >
            {showOrgType && (
              <div>
                <ChartCard
                  title={translate('Users by organization type')}
                  getExportData={() =>
                    getExportData(
                      translate('Organization type'),
                      orgTypeChartData,
                    )
                  }
                  isEmpty={orgTypeChartData.length === 0}
                >
                  {(ref) => <DonutChart ref={ref} data={orgTypeChartData} />}
                </ChartCard>
              </div>
            )}
            {showJobTitle && (
              <div>
                <ChartCard
                  title={translate('Users by job position')}
                  getExportData={() =>
                    getExportData(
                      translate('Job position'),
                      jobPositionChartData,
                    )
                  }
                  isEmpty={jobPositionChartData.length === 0}
                >
                  {(ref) => (
                    <DonutChart ref={ref} data={jobPositionChartData} />
                  )}
                </ChartCard>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
