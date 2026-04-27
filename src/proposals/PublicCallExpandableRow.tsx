import { FunctionComponent, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { formatDateTime } from '@/core/dateUtils';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { Call } from './types';
import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
  getRoundsWithStatus,
} from './utils';

export const PublicCallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const activeRound = useMemo(() => {
    const items = getRoundsWithStatus(row.rounds);
    const first = items[0];
    if (
      first &&
      (first.status.value === 'open' || first.status.value === 'scheduled')
    ) {
      return first;
    }
    return null;
  }, [row]);

  return (
    <ExpandableContainer>
      <Row>
        <Col xs={12} className="text-dark mb-2">
          {row.description ? (
            <Card className="card-bordered card-solid">
              <Card.Header>
                <h6 className="mb-0 fw-bold">{translate('Description')}</h6>
              </Card.Header>
              <Card.Body>
                <SafeMarkdown text={row.description} smallTitles />
              </Card.Body>
            </Card>
          ) : (
            <p className="text-muted fst-italic fs-7 mb-0">
              {translate('No description')}
            </p>
          )}
        </Col>

        {activeRound ? (
          <>
            <Col lg={12} xl={6}>
              <Field
                label={translate('Next cutoff')}
                value={formatDateTime(activeRound.cutoff_time)}
                labelCol={4}
                valueCol={8}
              />

              <Field
                label={translate('Review strategy')}
                value={formatRoundReviewStrategy(activeRound.review_strategy)}
                labelCol={4}
                valueCol={8}
              />
            </Col>
            <Col lg={12} xl={6}>
              <Field
                label={translate('Round strategy')}
                value={formatRoundAllocationStrategy(
                  activeRound.deciding_entity,
                )}
                labelCol={4}
                valueCol={8}
              />

              <Field
                label={translate('Allocation strategy')}
                value={formatRoundAllocationTime(activeRound.allocation_time)}
                labelCol={4}
                valueCol={8}
              />
            </Col>
          </>
        ) : (
          <Col xs={12}>
            <p className="text-muted fst-italic fs-7 mb-0">
              {translate('No active round')}
            </p>
          </Col>
        )}
      </Row>
    </ExpandableContainer>
  );
};
