import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { CircleProgressStatus } from './CircleProgressStatus';
import { PublicOfferingDataCard } from './PublicOfferingDataCard';

interface PublicOfferingDocumentationProps {
  offering: Offering;
}

export const PublicOfferingDocumentation: FunctionComponent<PublicOfferingDocumentationProps> =
  ({ offering }) => {
    if (!offering) return null;

    return (
      <PublicOfferingDataCard
        title={translate('Documentation')}
        icon="fa fa-book"
        actions={
          <Button variant="light" className="mw-100px w-100">
            Edit
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={99} />
          </div>
        }
      >
        <div className="mb-6">
          <strong>Documentation links:</strong>
          <a className="d-block text-link">- How to measure systems</a>
          <a className="d-block text-link">- Deploy hardware on Waldur</a>
          <a className="d-block text-link">- Login to chromatography UI</a>
          <a className="d-block text-link">- Booking time slots with Waldur</a>
        </div>
        <div>
          <strong>Getting Started Guide:</strong>
          <p>
            In addition to the package installation, this One-Click also:
            <br />
            <br />
            - Configures Docker per the official Docker recommendations.
            <br />- Configures Docker Compose per the official Docker
            <br />
            <br />
            Compose recommendations. Once the Docker One-Click Droplet is
            created, you can log into it as root. Make sure to substitute the
            Droplet’s public IPv4 address.
          </p>
        </div>
      </PublicOfferingDataCard>
    );
  };
