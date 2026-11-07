import { FC } from 'react';
import { WorkflowCheck } from 'waldur-js-client';

import { AlertItem, cn } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

import { summaryText } from './findings';
import { CALL_VALIDATION_STATE } from './WorkflowCheckPanel';

/**
 * The workflow check in one line, over the steps: how many errors and
 * warnings, and the way to the Validation tab listing them. A clean check
 * shows nothing, so the alert only appears when there is something to fix.
 */
export const WorkflowCheckSummary: FC<{
  check: WorkflowCheck;
  className?: string;
}> = ({ check, className }) => {
  const summary = summaryText(check.summary);
  if (!summary) {
    return null;
  }
  return (
    <AlertItem
      variant={check.summary.error ? 'error' : 'warning'}
      type="floating"
      // White, like the cards on this grey page.
      className={cn('bg-primary', className)}
      data-testid="workflow-check-summary"
      title={
        check.can_activate
          ? translate('Workflow check: {summary}; none blocks activation.', {
              summary,
            })
          : translate('Workflow check: {summary}.', { summary })
      }
      actions={
        <Link
          state={CALL_VALIDATION_STATE}
          params={{ tab: 'check' }}
          buttonVariant="tertiary"
          buttonSize="sm"
          label={translate('Open validation')}
        />
      }
    />
  );
};
