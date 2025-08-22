import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { BroadcastMessage } from 'waldur-js-client';

import { SafeMarkdown } from '@waldur/core/SafeMarkdown';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import './BroadcastTemplateExpandableRow.scss';

export const BroadcastTemplateExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <Card className="broadcast-template card-bordered card-solid">
      <Card.Header>
        <h6 className="mb-0 fw-bold">{translate('Body')}</h6>
      </Card.Header>
      <Card.Body>
        <SafeMarkdown text={row.body} smallTitles />
      </Card.Body>
    </Card>
  </ExpandableContainer>
);
