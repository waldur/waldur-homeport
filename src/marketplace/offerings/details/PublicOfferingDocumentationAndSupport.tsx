import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingDocumentationAndSupportProps {
  offering: Offering;
}

export const PublicOfferingDocumentationAndSupport: FunctionComponent<
  PublicOfferingDocumentationAndSupportProps
> = ({ offering }) => (
  <Card className="card-bordered mb-10">
    <Card.Body>
      <PublicOfferingCardTitle>
        {translate('Documentation & support')}
      </PublicOfferingCardTitle>
      <div className="d-flex flex-column gap-4">
        {offering.documentation_url && (
          <div>
            <p className="fw-bold mb-1">{translate('Service documentation')}</p>
            <a
              href={offering.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
            >
              <span className="svg-icon svg-icon-2">
                <ArrowSquareOutIcon weight="bold" />
              </span>{' '}
              {translate('Open documentation')}
            </a>
          </div>
        )}
        {offering.helpdesk_url && (
          <div>
            <p className="fw-bold mb-1">{translate('Service support')}</p>
            <a
              href={offering.helpdesk_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
            >
              <span className="svg-icon svg-icon-2">
                <ArrowSquareOutIcon weight="bold" />
              </span>{' '}
              {translate('Open helpdesk')}
            </a>
          </div>
        )}
      </div>
    </Card.Body>
  </Card>
);
