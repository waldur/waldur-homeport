import { IssueStatus } from 'waldur-js-client';

export type IssueStatusAdmin = IssueStatus;

// Type constants matching backend
export const IssueStatusTypes = {
  RESOLVED: 0,
  CANCELED: 1,
} as const;

export const IssueStatusTypeChoices = [
  { value: IssueStatusTypes.RESOLVED, label: 'Resolved' },
  { value: IssueStatusTypes.CANCELED, label: 'Canceled' },
];
