import Markdown from 'markdown-to-jsx';
import { Card } from 'react-bootstrap';

import { CopyToClipboardBlock } from '@waldur/core/CopyToClipboardBlock';
import { translate } from '@waldur/i18n';
import { formatTemplate } from '@waldur/i18n/translate';

const GettingStartedMessage = ({ resource, offering }) => {
  const context = {
    backend_id: resource.effective_id || resource.backend_id,
    resource_name: resource.name,
    resource_username: resource.username,
  };
  return (
    <Markdown
      options={{
        overrides: {
          CopyToClipboard: { component: CopyToClipboardBlock },
        },
      }}
    >
      {formatTemplate(offering.getting_started, context)}
    </Markdown>
  );
};

export const GettingStartedCard = ({ resource, offering }) =>
  offering.getting_started ? (
    <Card className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Getting started')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <GettingStartedMessage resource={resource} offering={offering} />
      </Card.Body>
    </Card>
  ) : null;
