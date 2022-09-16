import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const PublicOfferingGetHelp: FunctionComponent = () => (
  <Card className="mb-10">
    <Card.Body>
      <div className="text-center">
        <h2 className="mb-10">{translate('Get help')}</h2>
        <Button variant="dark" className="mb-5">
          {translate('Vendor support pages')}
        </Button>
        <div>
          <Link
            state=""
            className="text-decoration-underline text-dark text-hover-primary fs-6 mb-2 fw-bold"
          >
            {translate('Contact vendor')}
          </Link>
        </div>
      </div>
    </Card.Body>
  </Card>
);
