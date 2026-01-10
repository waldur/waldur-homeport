import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ProtectedRound } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
} from '@waldur/proposals/utils';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

interface RoundExpandableRowProps {
  row: ProtectedRound;
}

const SectionTitle: FunctionComponent<{
  title: string;
  className?: string;
}> = ({ title, className }) => (
  <div className={`fw-bold text-muted mb-3 ${className || ''}`}>{title}</div>
);

export const RoundExpandableRow: FunctionComponent<RoundExpandableRowProps> = ({
  row,
}) => {
  return (
    <ExpandableContainer>
      <Row>
        <Col md={6}>
          <SectionTitle title={translate('Submission settings')} />
          <Field
            label={translate('Start time')}
            value={formatDateTime(row.start_time)}
          />
          <Field
            label={translate('Cutoff time')}
            value={formatDateTime(row.cutoff_time)}
          />
          <SectionTitle title={translate('Review settings')} className="mt-4" />
          <Field
            label={translate('Review strategy')}
            value={formatRoundReviewStrategy(row.review_strategy)}
          />
          <Field
            label={translate('Review duration in days')}
            value={renderFieldOrDash(row.review_duration_in_days)}
          />
          <Field
            label={translate('Minimum number of reviewers')}
            value={renderFieldOrDash(row.minimum_number_of_reviewers)}
          />
        </Col>
        <Col md={6}>
          <SectionTitle title={translate('Allocation settings')} />
          <Field
            label={translate('Deciding entity')}
            value={formatRoundAllocationStrategy(row.deciding_entity)}
          />
          <Field
            label={translate('Allocation time')}
            value={formatRoundAllocationTime(row.allocation_time)}
          />
          {row.allocation_time?.toLowerCase() === 'fixed_date' && (
            <Field
              label={translate('Allocation date')}
              value={formatDateTime(row.allocation_date)}
            />
          )}
          <Field
            label={translate('Minimal average scoring')}
            value={renderFieldOrDash(row.minimal_average_scoring)}
          />
        </Col>
      </Row>
    </ExpandableContainer>
  );
};
