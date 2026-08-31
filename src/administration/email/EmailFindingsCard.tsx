import {
  CheckCircleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import { translate } from '@/i18n';

import type { EmailFinding } from './api';

const ICONS = {
  ERROR: <XCircleIcon size={20} weight="bold" className="text-danger" />,
  WARNING: (
    <WarningCircleIcon size={20} weight="bold" className="text-warning" />
  ),
  OK: <CheckCircleIcon size={20} weight="bold" className="text-success" />,
};

const FindingRow: FC<{ finding: EmailFinding }> = ({ finding }) => (
  <li className="d-flex gap-3 py-3 border-bottom">
    <div className="flex-shrink-0 pt-1">
      {ICONS[finding.level] ?? ICONS.WARNING}
    </div>
    <div>
      <div className="fw-semibold">{finding.title}</div>
      {finding.detail && <div className="text-muted">{finding.detail}</div>}
      {finding.remediation && (
        <div className="text-muted fst-italic mt-1">{finding.remediation}</div>
      )}
    </div>
  </li>
);

interface EmailFindingsCardProps {
  findings: EmailFinding[];
}

export const EmailFindingsCard: FC<EmailFindingsCardProps> = ({ findings }) => {
  const problems = findings.filter((finding) => finding.level !== 'OK');
  // The passing checks are the least interesting rows, so they go last and the
  // card only opens by default when there is something to act on.
  const ordered = [...problems, ...findings.filter((f) => f.level === 'OK')];

  return (
    <AccordionCard
      id="email-findings"
      title={translate('Checks')}
      subtitle={
        problems.length
          ? translate('{count} problems detected', { count: problems.length })
          : translate('No problems detected')
      }
      defaultOpen={problems.length > 0}
      className="mb-6"
    >
      <ul className="list-unstyled mb-0">
        {ordered.map((finding) => (
          <FindingRow key={finding.code} finding={finding} />
        ))}
      </ul>
    </AccordionCard>
  );
};
