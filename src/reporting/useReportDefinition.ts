import { useMemo } from 'react';

import {
  getCategoryConfig,
  ReportDefinition,
  ReportCategory,
} from './constants';

interface ReportInfo {
  report: ReportDefinition;
  category: ReportCategory;
}

export const useReportDefinition = (key: string): ReportInfo | undefined => {
  return useMemo(() => {
    const config = getCategoryConfig();
    for (const [category, categoryConfig] of Object.entries(config)) {
      const report = categoryConfig?.reports?.find((r) => r.key === key);
      if (report) {
        return { report, category: category as ReportCategory };
      }
    }
    return undefined;
  }, [key]);
};
