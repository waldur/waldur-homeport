import { Card } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';

import { EditDocumentsButton } from './EditDocumentsButton';

const dummyLinks = [
  { url: '#', label: 'MyFirstDocument.pdf' },
  { url: '#', label: 'Specifications_2023call.pdf' },
];

export const CallDocumentsSection = () => {
  return (
    <Card id="documents" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>
          {dummyLinks.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('Documents')}</span>
        </Card.Title>
        <div className="card-toolbar">
          <EditDocumentsButton />
        </div>
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
