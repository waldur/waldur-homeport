import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { ChartCard } from '@waldur/core/ChartCard';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ExportData } from '@waldur/table/exporters/types';
import { formatOrganizationType } from '@waldur/user/support/aai-constants';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

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
      <div className="container-fluid pb-6">
        {(showNationality || showCountry) && (
          <Row className="mb-6 g-6">
            {showNationality && (
              <Col md={showCountry ? 6 : 12}>
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
              </Col>
            )}
            {showCountry && (
              <Col md={showNationality ? 6 : 12}>
                <ChartCard
                  title={translate('Users by country')}
                  getExportData={() =>
                    getExportData(translate('Country'), countryChartData)
                  }
                  isEmpty={countryChartData.length === 0}
                >
                  {(ref) => <BarChart ref={ref} data={countryChartData} />}
                </ChartCard>
              </Col>
            )}
          </Row>
        )}
        {(showOrgType || showJobTitle) && (
          <Row className="g-6">
            {showOrgType && (
              <Col md={showJobTitle ? 6 : 12}>
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
              </Col>
            )}
            {showJobTitle && (
              <Col md={showOrgType ? 6 : 12}>
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
              </Col>
            )}
          </Row>
        )}
      </div>
    </>
  );
};
