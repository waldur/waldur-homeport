import { FC } from 'react';
import { Badge, Card, Col } from 'react-bootstrap';

import { formatRelativeWithHour } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';

export const CallCard: FC<{ call }> = ({ call }) => (
  <Col lg={4} className="mb-3 d-flex">
    <Card className="flex-grow-1 flex-shrink-1 flex-basis-auto">
      <Card.Header>
        <Card.Title>
          <h2>{call.name}</h2>
        </Card.Title>
        <Card.Subtitle>
          <small>{call.customer_name}</small>
        </Card.Subtitle>
      </Card.Header>
      <Card.Body className="d-flex flex-column">
        <Card.Text className="flex-grow-1 flex-shrink-0">
          {call.description}
        </Card.Text>
        <div className="d-flex justify-content-between">
          <Card.Text>
            <Badge bg="warning" text="dark">
              {translate(
                'Cutoff: {title}',
                {
                  title: (
                    <strong>{formatRelativeWithHour(call.end_date)}</strong>
                  ),
                },
                formatJsxTemplate,
              )}
            </Badge>
          </Card.Text>
          <Link
            state="public-calls.details"
            params={{ uuid: call.uuid }}
            label={translate('View call')}
          />
        </div>
      </Card.Body>
    </Card>
  </Col>
);
