import { FC } from 'react';
import {
  CustomerOecdCodeStats,
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

import { OecdUsageChart } from './OecdUsageChart';
import { OecdUsageTable } from './OecdUsageTable';

interface OecdUsageTabProps {
  usages: ProjectsUsagesGroupedByOecd | null;
  limits: ProjectsLimitsGroupedByOecd | null;
  projectCounts: CustomerOecdCodeStats[];
}

export const OecdUsageTab: FC<OecdUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <OecdUsageChart projectCounts={projectCounts} />
      </div>
      <div>
        <OecdUsageTable usages={usages} limits={limits} />
      </div>
    </div>
  );
};
