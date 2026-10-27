import { FunctionComponent } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { formatDateTime } from '@/core/dateUtils';
import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { Call } from './types';
import { getActiveRound } from './utils';

export const PublicCallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const activeRound = getActiveRound(row);

  return (
    <ExpandableContainer>
      <Row>
        <Col xs={12} className="text-primary mb-1.5">
          {row.description ? (
            <Card className="card-bordered card-solid">
              <Card.Header>
                <h6 className="mb-0 font-medium">{translate('Description')}</h6>
              </Card.Header>
              <Card.Body>
                <SafeMarkdown text={row.description} smallTitles />
              </Card.Body>
            </Card>
          ) : (
            <p className="text-quaternary italic text-xs mb-0">
              {translate('No description')}
            </p>
          )}
        </Col>

        {activeRound ? (
          <Col lg={12} xl={6}>
            <Field
              label={translate('Next cutoff')}
              value={formatDateTime(activeRound.cutoff_time)}
              labelCol={4}
              valueCol={8}
            />
          </Col>
        ) : (
          <Col xs={12}>
            <p className="text-quaternary italic text-xs mb-0">
              {translate('No active round')}
            </p>
          </Col>
        )}
      </Row>
    </ExpandableContainer>
  );
};
