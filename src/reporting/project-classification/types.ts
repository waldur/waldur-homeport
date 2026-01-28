import {
  ProjectsLimitsGroupedByIndustryFlag,
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByIndustryFlag,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

export interface ProjectClassificationStats {
  oecdUsages: ProjectsUsagesGroupedByOecd | null;
  oecdLimits: ProjectsLimitsGroupedByOecd | null;
  industryUsages: ProjectsUsagesGroupedByIndustryFlag | null;
  industryLimits: ProjectsLimitsGroupedByIndustryFlag | null;
  oecdProjectCounts: Array<{ oecd_code: string; count: number }>;
  industryProjectCounts: Array<{ industry_flag: boolean; count: number }>;
}

export interface ClassificationSummary {
  totalProjects: number;
  academicProjects: number;
  industryProjects: number;
}

export interface ClassificationUsageRow {
  category: string;
  componentType: string;
  usage: string;
  limit: string;
}
