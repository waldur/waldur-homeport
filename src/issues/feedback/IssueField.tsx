import { Link } from '@/core/Link';

const issueLabel = (key: string, summary: string) =>
  key ? `${key}: ${summary}` : summary;

export const IssueField = ({ row }) => (
  <Link
    state="support.detail"
    params={{ issue_uuid: row.issue_uuid }}
    label={issueLabel(row.issue_key, row.issue_summary)}
  />
);
