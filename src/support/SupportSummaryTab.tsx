import { Card } from 'react-bootstrap';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { translate } from '@waldur/i18n';
import { Issue } from '@waldur/issues/list/types';

interface SupportSummaryTabProps {
  issue: Issue;
  summary?: string;
}

export const SupportSummaryTab = (props: SupportSummaryTabProps) => (
  <>
    {props.summary && (
      <p className="mb-3">
        <FormattedHtml html={props.summary} />
      </p>
    )}
    <Card>
      <Card.Header>
        <Card.Title>{translate('Description')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <FormattedJira text={props.issue?.description} />
      </Card.Body>
    </Card>
  </>
);
