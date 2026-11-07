import {
  BudgetReport,
  PortfolioReport,
  ReviewerReport,
  RoundReport,
  WorkflowReport,
} from 'waldur-js-client';

export type ReportKind =
  'portfolio' | 'workflow' | 'reviewers' | 'rounds' | 'budgets';

export interface ReportData {
  portfolio: PortfolioReport;
  workflow: WorkflowReport;
  reviewers: ReviewerReport;
  rounds: RoundReport;
  budgets: BudgetReport;
}

/**
 * What the reports cover: every call of a call-managing organization that the
 * user may report on, one call when `callUuid` is given, or, for staff and
 * support, every call of every organization when `global` is set.
 */
export interface ReportScope {
  organizationUuid?: string;
  callUuid?: string;
  global?: boolean;
}

/** The filters of the reports, as the URL holds them. */
export interface ReportFilters {
  /** Call-managing organizations; the reports across all of them only. */
  organizations?: string[];
  calls: string[];
  round?: string;
  /** `yyyy-MM-dd` */
  from?: string;
  /** `yyyy-MM-dd` */
  to?: string;
}

export interface ReportViewProps<K extends ReportKind> {
  data: ReportData[K];
  scope: ReportScope;
  filters: ReportFilters;
}
