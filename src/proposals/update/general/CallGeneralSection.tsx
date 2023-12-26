import Markdown from 'markdown-to-jsx';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';

import { CallGeneralDataTable } from './CallGeneralDataTable';
import { EditGeneralInfoButton } from './EditGeneralInfoButton';

interface CallGeneralSectionProps {
  call: ProposalCall;
}

export const CallGeneralSection: FC<CallGeneralSectionProps> = (props) => {
  return (
    <Card id="general" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>
          {!props.call.description ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('General')}</span>
        </Card.Title>
        <div className="card-toolbar">
          <EditGeneralInfoButton />
        </div>
      </Card.Header>
      <Card.Body>
        <CallGeneralDataTable />
        <Markdown>{props.call.description}</Markdown>
      </Card.Body>
    </Card>
  );
};
