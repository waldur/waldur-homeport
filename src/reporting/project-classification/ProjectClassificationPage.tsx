import { FC, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ClassificationSummaryCards } from './ClassificationSummaryCards';
import { IndustryUsageTab } from './IndustryUsageTab';
import { OecdUsageTab } from './OecdUsageTab';
import {
  useProjectClassificationStats,
  useProjectClassificationSummary,
} from './useProjectClassificationStats';

type TabKey = 'oecd' | 'industry';

export const ProjectClassificationPage: FC = () => {
  useTitle(translate('Project classification'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'project-classification',
  });

  const [activeTab, setActiveTab] = useState<TabKey>('oecd');
  const { data, isLoading, error, refetch } = useProjectClassificationStats();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useProjectClassificationSummary();

  if (isLoading || summaryLoading) {
    return <LoadingSpinner />;
  }

  if (error || summaryError) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || !summary) {
    return (
      <NoResult
        title={translate('No classification data found')}
        message={translate(
          'There is no project classification data to display.',
        )}
        noAction
      />
    );
  }

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4">
        <h1 className="mb-0 fs-1x">{translate('Project classification')}</h1>
      </div>

      <ClassificationSummaryCards summary={summary} />

      <div className="my-6">
        <ToggleButtonGroup
          type="radio"
          name="activeTab"
          value={activeTab}
          onChange={(v) => setActiveTab(v)}
        >
          <ToggleButton
            id="tbg-oecd"
            value="oecd"
            variant="tertiary"
            className="px-6"
          >
            {translate('By OECD code')}
          </ToggleButton>
          <ToggleButton
            id="tbg-industry"
            value="industry"
            variant="tertiary"
            className="px-6"
          >
            {translate('By industry')}
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {activeTab === 'oecd' ? (
        <OecdUsageTab
          usages={data.oecdUsages}
          limits={data.oecdLimits}
          projectCounts={data.oecdProjectCounts}
        />
      ) : (
        <IndustryUsageTab
          usages={data.industryUsages}
          limits={data.industryLimits}
          projectCounts={data.industryProjectCounts}
        />
      )}
    </>
  );
};
