import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { AccordionCard } from '@/core/AccordionCard';
import { translate } from '@/i18n';

interface PubSubIssuesCardProps {
  issues: string[];
}

export const PubSubIssuesCard: FC<PubSubIssuesCardProps> = ({ issues }) => {
  const hasIssues = issues.length > 0;

  return (
    <AccordionCard
      id="pubsub-issues"
      title={translate('Issues')}
      subtitle={
        hasIssues
          ? translate('{count} issues detected', { count: issues.length })
          : translate('No issues')
      }
      defaultOpen={hasIssues}
      className="mb-6"
    >
      {hasIssues ? (
        <div className="d-flex flex-column gap-2">
          {issues.map((issue, index) => (
            <AlertItem
              key={index}
              variant="warning"
              type="floating"
              title={issue}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted mb-0">
          {translate(
            'No issues detected. PubSub system is operating normally.',
          )}
        </p>
      )}
    </AccordionCard>
  );
};
