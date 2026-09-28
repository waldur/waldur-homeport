import { FC, useState } from 'react';

import { SegmentedControl } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { ClassificationSummaryCards } from './ClassificationSummaryCards';
import { IndustryUsageTab } from './IndustryUsageTab';
import { OecdUsageTab } from './OecdUsageTab';
import {
  useProjectClassificationStats,
  useProjectClassificationSummary,
} from './useProjectClassificationStats';

type TabKey = 'oecd' | 'industry';

export const ProjectClassificationPage: FC = () => {
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
      <ReportingTitle reportKey="project-classification" />

      <ClassificationSummaryCards summary={summary} />

      <div className="my-6">
        <SegmentedControl<TabKey>
          aria-label={translate('Classification view')}
          itemClassName="px-6"
          options={[
            { value: 'oecd', label: translate('By OECD code') },
            { value: 'industry', label: translate('By industry') },
          ]}
          value={activeTab}
          onValueChange={setActiveTab}
        />
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
