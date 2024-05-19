import { Card } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';

export const CallDocumentsCard = ({ call }) => {
  return (
    <Card id="documents" className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Documents')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <ul>
          {call.documents.map((document, i) => (
            <li key={i}>
              <ExternalLink
                url={document.file}
                label={decodeURIComponent(
                  document.file
                    .split('/')
                    .pop()
                    .replace(/_[^_]+\./, '.'),
                )}
                iconless
              />
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
};
