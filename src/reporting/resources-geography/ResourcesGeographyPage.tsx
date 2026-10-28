import { FC } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { ResourcesByCountryChart } from './ResourcesByCountryChart';
import { ResourcesByOfferingTable } from './ResourcesByOfferingTable';
import { ResourcesByOrgGroupChart } from './ResourcesByOrgGroupChart';
import { ResourcesGeographySummaryCards } from './ResourcesGeographySummaryCards';
import {
  useResourcesGeographyStats,
  useResourcesGeographySummary,
} from './useResourcesGeographyStats';

export const ResourcesGeographyPage: FC = () => {
  const { data, isLoading, error, refetch } = useResourcesGeographyStats();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useResourcesGeographySummary();

  if (isLoading || summaryLoading) {
    return <LoadingSpinner />;
  }

  if (error || summaryError) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || !summary || summary.totalResources === 0) {
    return (
      <NoResult
        title={translate('No resources found')}
        message={translate('There are no active resources to display.')}
        callback={() => refetch()}
        buttonTitle={translate('Refresh')}
      />
    );
  }

  return (
    <>
      <ReportingTitle reportKey="resources-geography" />

      <ResourcesGeographySummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <ResourcesByCountryChart data={data.byCountry} />
        </div>
        <div>
          <ResourcesByOrgGroupChart data={data.byOrgGroup} />
        </div>
      </div>

      <div>
        <ResourcesByOfferingTable />
      </div>
    </>
  );
};
