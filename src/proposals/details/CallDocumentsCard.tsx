import { Card } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';

const dummyLinks = [
  { url: '#', label: 'MyFirstDocument.pdf' },
  { url: '#', label: 'Specifications_2023call.pdf' },
];

export const CallDocumentsCard = () => {
  return (
    <Card id="documents" className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Documents')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <ul>
          {dummyLinks.map((link, i) => (
            <li key={i}>
              <ExternalLink url={link.url} label={link.label} iconless />
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
};
