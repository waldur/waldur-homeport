import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ProtectedRound } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

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
            label={translate('Review duration in days')}
            value={renderFieldOrDash(row.review_duration_in_days)}
          />
        </Col>
        <Col md={6}>
          <SectionTitle title={translate('Allocation settings')} />
          <Field
            label={translate('Allocation date')}
            value={
              row.allocation_date
                ? formatDateTime(row.allocation_date)
                : renderFieldOrDash(null)
            }
          />
        </Col>
      </Row>
    </ExpandableContainer>
  );
};
