import { Link } from '@waldur/core/Link';

const issueLabel = (key: string, summary: string) =>
  key ? `${key}: ${summary}` : summary;

export const IssueField = ({ row }) => (
  <Link
    state="support.detail"
    params={{ uuid: row.issue_uuid }}
    label={issueLabel(row.issue_key, row.issue_summary)}
  />
);
