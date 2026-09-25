import { ChangelogFlatEntry } from 'waldur-js-client';

export interface SecurityAlert {
  max_urgency: 'critical' | 'high' | 'moderate' | 'low';
  count: number;
  versions: Array<{
    version: string;
    max_urgency: string;
  }>;
}

export interface ChangelogSummary {
  versions_behind: number;
  breaking_release_count: number;
  has_breaking_changes: boolean;
  security_alert?: SecurityAlert;
}

// Entries as the changelog-entries endpoint returns them.
export type ChangelogEntry = ChangelogFlatEntry;
