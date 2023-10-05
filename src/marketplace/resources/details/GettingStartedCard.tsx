import Markdown from 'markdown-to-jsx';
import { Card } from 'react-bootstrap';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';

export const GettingStartedCard = ({ resource, offering }) =>
  offering.getting_started ? (
    <Card className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Getting started')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Markdown
          options={{
            overrides: {
              CopyToClipboard: { component: CopyToClipboardContainer },
            },
          }}
        >
          {(offering.getting_started as string)
            .replaceAll(
              'backend_id',
              resource.effective_id || resource.backend_id,
            )
            .replaceAll('resource_name', resource.name)}
        </Markdown>
      </Card.Body>
    </Card>
  ) : null;
