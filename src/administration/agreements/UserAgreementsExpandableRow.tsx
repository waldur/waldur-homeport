import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { UserAgreement } from 'waldur-js-client';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const UserAgreementsExpandableRow: FunctionComponent<{
  row: UserAgreement;
}> = ({ row }) => (
  <ExpandableContainer>
    <Card className="card-bordered card-solid">
      <Card.Header>
        <h6 className="mb-0 fw-bold">{translate('Content')}</h6>
      </Card.Header>
      <Card.Body>
        <SafeMarkdown text={row.content} smallTitles />
      </Card.Body>
    </Card>
  </ExpandableContainer>
);
