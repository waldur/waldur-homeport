import { FC, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';

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
      />
    );
  }

  return (
    <>
      <ClassificationSummaryCards summary={summary} />

      <Tab.Container
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k as TabKey)}
      >
        <Nav variant="tabs" className="nav-line-tabs mb-6">
          <Nav.Item>
            <Nav.Link as="button" eventKey="oecd">
              {translate('By OECD code')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as="button" eventKey="industry">
              {translate('By industry')}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="oecd" mountOnEnter>
            <OecdUsageTab
              usages={data.oecdUsages}
              limits={data.oecdLimits}
              projectCounts={data.oecdProjectCounts}
            />
          </Tab.Pane>
          <Tab.Pane eventKey="industry" mountOnEnter>
            <IndustryUsageTab
              usages={data.industryUsages}
              limits={data.industryLimits}
              projectCounts={data.industryProjectCounts}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};
