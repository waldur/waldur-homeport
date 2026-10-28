import { FC } from 'react';
import {
  ProjectsLimitsGroupedByIndustryFlag,
  ProjectsUsagesGroupedByIndustryFlag,
} from 'waldur-js-client';

import { IndustryUsageChart } from './IndustryUsageChart';
import { IndustryUsageTable } from './IndustryUsageTable';

interface IndustryUsageTabProps {
  usages: ProjectsUsagesGroupedByIndustryFlag | null;
  limits: ProjectsLimitsGroupedByIndustryFlag | null;
  projectCounts: Array<{ industry_flag: boolean; count: number }>;
}

export const IndustryUsageTab: FC<IndustryUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <IndustryUsageChart projectCounts={projectCounts} />
      </div>
      <div>
        <IndustryUsageTable usages={usages} limits={limits} />
      </div>
    </div>
  );
};
