import { CheckIcon, XIcon, ClockIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Alert, Card, Badge, Row, Col } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

interface OfferingMetadata {
  offering_name: string;
  exported_components: string[];
  export_timestamp: string;
  offering_type?: string;
  offering_state?: string;
  category_name?: string;
}

interface OfferingMetadataDisplayProps {
  metadata: OfferingMetadata;
  isValid: boolean;
  error?: string;
}

export const OfferingMetadataDisplay: FunctionComponent<
  OfferingMetadataDisplayProps
> = ({ metadata, isValid, error }) => {
  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        <XIcon size={16} className="me-2" weight="bold" />
        <strong>{translate('Invalid file format:')}</strong> {error}
      </Alert>
    );
  }

  if (!isValid || !metadata) {
    return null;
  }

  // Metadata is already parsed from YAML content
  const offeringInfo = {
    type: metadata.offering_type,
    state: metadata.offering_state,
    category_name: metadata.category_name,
  };

  const componentLabels: Record<string, string> = {
    components: translate('Components'),
    plans: translate('Pricing Plans'),
    screenshots: translate('Screenshots'),
    files: translate('Files'),
    endpoints: translate('Access Endpoints'),
    organization_groups: translate('Organization Groups'),
    terms_of_service: translate('Terms of Service'),
  };

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex align-items-center">
        <CheckIcon size={16} className="text-success me-2" weight="bold" />
        <strong>{translate('Valid offering export file')}</strong>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h6>{translate('Offering Information')}</h6>
            <p>
              <strong>{translate('Name:')}</strong>{' '}
              <span className="text-muted">{metadata.offering_name}</span>
            </p>
            {offeringInfo.type && (
              <p>
                <strong>{translate('Type:')}</strong>{' '}
                <Badge bg="primary">{offeringInfo.type}</Badge>
              </p>
            )}
            {offeringInfo.state && (
              <p>
                <strong>{translate('State:')}</strong>{' '}
                <Badge
                  bg={offeringInfo.state === 'Active' ? 'success' : 'secondary'}
                >
                  {offeringInfo.state}
                </Badge>
              </p>
            )}
            {offeringInfo.category_name && (
              <p>
                <strong>{translate('Category:')}</strong>{' '}
                <span className="text-muted">{offeringInfo.category_name}</span>
              </p>
            )}
          </Col>
          <Col md={6}>
            <h6>{translate('File Details')}</h6>
            <p>
              <ClockIcon size={16} className="me-1" weight="bold" />
              <strong>{translate('Processed:')}</strong>{' '}
              <span className="text-muted">
                {formatDateTime(metadata.export_timestamp)}
              </span>
            </p>
          </Col>
        </Row>

        <div className="mt-3">
          <h6>{translate('Included Components')}</h6>
          <div className="d-flex flex-wrap gap-2">
            {metadata.exported_components.map((component) => (
              <Badge key={component} bg="primary" pill>
                {componentLabels[component] || component}
              </Badge>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
