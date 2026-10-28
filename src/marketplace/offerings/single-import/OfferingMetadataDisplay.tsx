import { CheckIcon, ClockIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { AlertItem, Badge } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';

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
      <AlertItem
        variant="error"
        type="floating"
        className="mt-2.5"
        title={translate('Invalid file format:')}
        body={error}
      />
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
    <div className="card mt-2.5">
      <div className="card-header flex items-center">
        <CheckIcon size={16} className="text-success me-1.5" weight="bold" />
        <strong>{translate('Valid offering export file')}</strong>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <div>
            <h6>{translate('Offering Information')}</h6>
            <p>
              <strong>{translate('Name:')}</strong>{' '}
              <span className="text-quaternary">{metadata.offering_name}</span>
            </p>
            {offeringInfo.type && (
              <p>
                <strong>{translate('Type:')}</strong>{' '}
                <Badge variant="primary">{offeringInfo.type}</Badge>
              </p>
            )}
            {offeringInfo.state && (
              <p>
                <strong>{translate('State:')}</strong>{' '}
                <Badge
                  variant={
                    offeringInfo.state === 'Active' ? 'success' : 'secondary'
                  }
                >
                  {offeringInfo.state}
                </Badge>
              </p>
            )}
            {offeringInfo.category_name && (
              <p>
                <strong>{translate('Category:')}</strong>{' '}
                <span className="text-quaternary">
                  {offeringInfo.category_name}
                </span>
              </p>
            )}
          </div>
          <div>
            <h6>{translate('File Details')}</h6>
            <p>
              <ClockIcon size={16} className="me-1" weight="bold" />
              <strong>{translate('Processed:')}</strong>{' '}
              <span className="text-quaternary">
                {formatDateTime(metadata.export_timestamp)}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-2.5">
          <h6>{translate('Included Components')}</h6>
          <div className="flex flex-wrap gap-1.5">
            {metadata.exported_components.map((component) => (
              <Badge key={component} variant="primary" shape="pill">
                {componentLabels[component] || component}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
