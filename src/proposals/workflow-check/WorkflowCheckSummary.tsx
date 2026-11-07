import { FC } from 'react';
import { WorkflowCheck } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

import { summaryText } from './findings';
import { CALL_VALIDATION_STATE } from './WorkflowCheckPanel';

/**
 * The workflow check in one line, over the steps: how many errors and
 * warnings, and the way to the Validation tab listing them.
 */
export const WorkflowCheckSummary: FC<{
  check: WorkflowCheck;
  className?: string;
}> = ({ check, className }) => {
  const summary = summaryText(check.summary);
  return (
    <AlertItem
      variant={
        check.summary.error
          ? 'error'
          : check.summary.warning
            ? 'warning'
            : 'success'
      }
      className={className}
      data-testid="workflow-check-summary"
      title={
        summary
          ? check.can_activate
            ? translate('Workflow check: {summary}; none blocks activation.', {
                summary,
              })
            : translate('Workflow check: {summary}.', { summary })
          : translate('Workflow check: no errors or warnings.')
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
